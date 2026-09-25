import { Op, literal, type Transaction } from 'sequelize';
import {
  Product,
  Category,
  Collection,
  ProductCollection,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductVariantOption,
} from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';
import { sequelize } from '../../shared/database/sequelize';
import type { ProductOptionInput, ProductVariantInput } from './product.dto';

const matrixInclude = [
  {
    model: ProductOption,
    as: 'options',
    include: [{ model: ProductOptionValue, as: 'values' }],
  },
  {
    model: ProductVariant,
    as: 'variants',
    include: [
      {
        model: ProductOptionValue,
        as: 'optionValues',
        attributes: ['id'],
        through: { attributes: [] },
      },
    ],
  },
  {
    model: Collection,
    as: 'collections',
    attributes: ['id'],
    through: { attributes: [] },
  },
];

function asBool(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function attachProduct(product: Product) {
  const plain = product.toJSON() as unknown as Record<string, unknown>;
  const collections = (product as Product & { collections?: Collection[] }).collections;
  const collectionIds = collections?.map((collection) => collection.id) ?? [];
  if (collectionIds.length === 0 && product.collectionId) {
    collectionIds.push(product.collectionId);
  }
  plain.collectionIds = collectionIds;

  const options = (
    (plain.options as Array<Record<string, unknown>> | undefined) ?? []
  )
    .slice()
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((option) => {
      const values = ((option.values as Array<Record<string, unknown>> | undefined) ?? [])
        .slice()
        .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
      return { ...option, values };
    });

  const variants = (
    (plain.variants as Array<Record<string, unknown>> | undefined) ?? []
  )
    .slice()
    .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
    .map((variant) => {
      const optionValues =
        (variant.optionValues as Array<{ id: string }> | undefined) ?? [];
      const { optionValues: _drop, ...rest } = variant;
      return {
        ...rest,
        optionValueIds: optionValues.map((value) => value.id),
        isDefault: asBool(variant.isDefault),
      };
    });

  plain.options = options;
  plain.variants = variants;
  return plain;
}

async function syncProductCollections(
  productId: string,
  collectionIds: string[] | undefined,
  transaction?: Transaction,
) {
  if (collectionIds === undefined) return;

  const uniqueIds = [...new Set(collectionIds.filter(Boolean))];
  await ProductCollection.destroy({ where: { productId }, transaction });
  if (uniqueIds.length > 0) {
    await ProductCollection.bulkCreate(
      uniqueIds.map((collectionId) => ({ productId, collectionId })),
      { transaction },
    );
  }
  await Product.update(
    { collectionId: uniqueIds[0] ?? null },
    { where: { id: productId }, transaction },
  );
}

async function clearProductMatrix(productId: string, transaction: Transaction) {
  const variants = await ProductVariant.findAll({
    where: { productId },
    attributes: ['id'],
    transaction,
  });
  const variantIds = variants.map((variant) => variant.id);
  if (variantIds.length > 0) {
    await ProductVariantOption.destroy({
      where: { variantId: { [Op.in]: variantIds } },
      transaction,
    });
  }
  await ProductVariant.destroy({ where: { productId }, transaction });

  const options = await ProductOption.findAll({
    where: { productId },
    attributes: ['id'],
    transaction,
  });
  const optionIds = options.map((option) => option.id);
  if (optionIds.length > 0) {
    await ProductOptionValue.destroy({
      where: { optionId: { [Op.in]: optionIds } },
      transaction,
    });
  }
  await ProductOption.destroy({ where: { productId }, transaction });
}

async function syncProductMatrix(
  productId: string,
  optionsInput: ProductOptionInput[] | undefined,
  variantsInput: ProductVariantInput[] | undefined,
  transaction: Transaction,
) {
  if (optionsInput === undefined && variantsInput === undefined) return;

  await clearProductMatrix(productId, transaction);

  const options = optionsInput ?? [];
  const variants = variantsInput ?? [];
  const valueIdMap = new Map<string, string>();

  for (let optionIndex = 0; optionIndex < options.length; optionIndex += 1) {
    const option = options[optionIndex];
    const optionId = option.id && option.id.trim() ? option.id : generateId();
    await ProductOption.create(
      {
        id: optionId,
        productId,
        key: option.key.trim(),
        label: fillLocalized(option.label),
        uiType: option.uiType ?? 'buttons',
        sortOrder: option.sortOrder ?? optionIndex,
      },
      { transaction },
    );

    for (let valueIndex = 0; valueIndex < option.values.length; valueIndex += 1) {
      const value = option.values[valueIndex];
      const clientId = value.id?.trim() || '';
      const valueId = clientId || generateId();
      if (clientId) valueIdMap.set(clientId, valueId);
      valueIdMap.set(valueId, valueId);

      await ProductOptionValue.create(
        {
          id: valueId,
          optionId,
          label: fillLocalized(value.label),
          value: value.value.trim(),
          hex: value.hex?.trim() || null,
          swatchUrl: value.swatchUrl?.trim() || null,
          sortOrder: value.sortOrder ?? valueIndex,
        },
        { transaction },
      );
    }
  }

  let defaultAssigned = false;
  for (let variantIndex = 0; variantIndex < variants.length; variantIndex += 1) {
    const variant = variants[variantIndex];
    const variantId = variant.id && variant.id.trim() ? variant.id : generateId();
    const wantDefault = asBool(variant.isDefault) || (!defaultAssigned && variantIndex === 0);
    if (wantDefault) defaultAssigned = true;

    await ProductVariant.create(
      {
        id: variantId,
        productId,
        sku: variant.sku.trim(),
        imageUrl: variant.imageUrl?.trim() || null,
        thumbUrl: variant.thumbUrl?.trim() || null,
        images: variant.images?.filter(Boolean) ?? null,
        textureMapUrl: variant.textureMapUrl?.trim() || null,
        texturePreviewUrl: variant.texturePreviewUrl?.trim() || null,
        price: variant.price ?? null,
        availability: variant.availability ?? null,
        height: variant.height ?? null,
        width: variant.width ?? null,
        depth: variant.depth ?? null,
        length: variant.length ?? null,
        isDefault: wantDefault,
        sortOrder: variant.sortOrder ?? variantIndex,
      },
      { transaction },
    );

    const resolvedValueIds = [
      ...new Set(
        (variant.optionValueIds ?? [])
          .map((id) => valueIdMap.get(id) ?? id)
          .filter(Boolean),
      ),
    ];

    if (resolvedValueIds.length > 0) {
      await ProductVariantOption.bulkCreate(
        resolvedValueIds.map((optionValueId) => ({
          variantId,
          optionValueId,
        })),
        { transaction },
      );
    }
  }
}

function parseOptionFilters(
  query: Record<string, string | string[] | undefined>,
): Array<{ key: string; value: string }> {
  const raw = query.option;
  const entries = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return entries
    .map((entry) => {
      const sep = entry.indexOf(':');
      if (sep <= 0) return null;
      const key = entry.slice(0, sep).trim();
      const value = entry.slice(sep + 1).trim();
      if (!key || !value) return null;
      return { key, value };
    })
    .filter((entry): entry is { key: string; value: string } => Boolean(entry));
}

async function productIdsMatchingOptions(
  filters: Array<{ key: string; value: string }>,
): Promise<string[] | null> {
  if (filters.length === 0) return null;

  // A product matches only if one variant covers every selected key:value pair.
  const havingParts: string[] = [];
  const replacements: Record<string, string | number> = {
    filterCount: filters.length,
  };

  filters.forEach((filter, index) => {
    const keyParam = `key${index}`;
    const valueParam = `value${index}`;
    replacements[keyParam] = filter.key;
    replacements[valueParam] = filter.value;
    havingParts.push(
      `SUM(po.\`key\` = :${keyParam} AND pov.value = :${valueParam}) > 0`,
    );
  });

  const [rows] = await sequelize.query(
    `
    SELECT pv.product_id AS product_id
    FROM product_variants pv
    INNER JOIN product_variant_options pvo ON pvo.variant_id = pv.id
    INNER JOIN product_option_values pov ON pov.id = pvo.option_value_id
    INNER JOIN product_options po ON po.id = pov.option_id AND po.product_id = pv.product_id
    GROUP BY pv.id, pv.product_id
    HAVING ${havingParts.join(' AND ')}
      AND COUNT(DISTINCT po.\`key\`) >= :filterCount
    `,
    { replacements },
  );

  return [
    ...new Set(
      (rows as Array<{ product_id: string }>).map((row) => row.product_id),
    ),
  ];
}

function parsePositiveInt(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const listOrder = [
  ['createdAt', 'DESC'],
  [{ model: ProductOption, as: 'options' }, 'sortOrder', 'ASC'],
  [
    { model: ProductOption, as: 'options' },
    { model: ProductOptionValue, as: 'values' },
    'sortOrder',
    'ASC',
  ],
  [{ model: ProductVariant, as: 'variants' }, 'sortOrder', 'ASC'],
] as const;

export class ProductService {
  async list(query: Record<string, string | string[] | undefined>) {
    const where: Record<string, unknown> = {};

    if (query.featured === 'true') where.featured = 1;

    if (typeof query.category === 'string' && query.category) {
      const cat = await Category.findOne({ where: { slug: query.category } });
      if (cat) {
        const children = await Category.findAll({
          where: { parentId: cat.id },
          attributes: ['id'],
        });
        const ids = [cat.id, ...children.map((c) => c.id)];
        where.categoryId = { [Op.in]: ids };
      }
    }

    if (typeof query.collection === 'string' && query.collection) {
      const col = await Collection.findOne({ where: { slug: query.collection } });
      if (col) {
        const links = await ProductCollection.findAll({
          where: { collectionId: col.id },
          attributes: ['productId'],
        });
        const linkedIds = links.map((link) => link.productId);
        where[Op.or as unknown as string] = [
          { id: { [Op.in]: linkedIds.length > 0 ? linkedIds : ['__none__'] } },
          { collectionId: col.id },
        ];
      }
    }

    if (typeof query.q === 'string' && query.q) {
      const term = `%${query.q}%`;
      const variantMatches = await ProductVariant.findAll({
        where: { sku: { [Op.like]: term } },
        attributes: ['productId'],
      });
      const variantProductIds = [
        ...new Set(variantMatches.map((variant) => variant.productId)),
      ];

      where[Op.or as unknown as string] = [
        { sku: { [Op.like]: term } },
        { slug: { [Op.like]: term } },
        { id: { [Op.in]: variantProductIds.length > 0 ? variantProductIds : ['__none__'] } },
        literal(
          `JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ${Product.sequelize!.escape(term)}`,
        ),
      ];
    }

    const optionFilters = parseOptionFilters(query);
    const optionProductIds = await productIdsMatchingOptions(optionFilters);
    if (optionProductIds !== null) {
      where.id = {
        [Op.in]: optionProductIds.length > 0 ? optionProductIds : ['__none__'],
      };
    }

    const wantsPagination =
      query.page !== undefined ||
      query.limit !== undefined ||
      query.paginated === 'true';

    if (!wantsPagination) {
      const products = await Product.findAll({
        where,
        include: matrixInclude,
        order: listOrder as never,
      });
      return products.map(attachProduct);
    }

    const page = parsePositiveInt(query.page, 1);
    const pageSize = Math.min(parsePositiveInt(query.limit, 24), 48);
    const offset = (page - 1) * pageSize;

    const [total, rows] = await Promise.all([
      Product.count({ where }),
      Product.findAll({
        where,
        include: matrixInclude,
        order: listOrder as never,
        limit: pageSize,
        offset,
      }),
    ]);

    return {
      items: rows.map(attachProduct),
      total,
      page,
      pageSize,
      hasMore: offset + rows.length < total,
    };
  }

  async getBySlugOrId(slugOrId: string) {
    const product =
      (await Product.findOne({
        where: { slug: slugOrId },
        include: matrixInclude,
        order: [
          [{ model: ProductOption, as: 'options' }, 'sortOrder', 'ASC'],
          [
            { model: ProductOption, as: 'options' },
            { model: ProductOptionValue, as: 'values' },
            'sortOrder',
            'ASC',
          ],
          [{ model: ProductVariant, as: 'variants' }, 'sortOrder', 'ASC'],
        ],
      })) ??
      (await Product.findByPk(slugOrId, {
        include: matrixInclude,
        order: [
          [{ model: ProductOption, as: 'options' }, 'sortOrder', 'ASC'],
          [
            { model: ProductOption, as: 'options' },
            { model: ProductOptionValue, as: 'values' },
            'sortOrder',
            'ASC',
          ],
          [{ model: ProductVariant, as: 'variants' }, 'sortOrder', 'ASC'],
        ],
      }));
    if (!product) throw AppError.notFound('Product not found');
    return attachProduct(product);
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    const collectionIds = data.collectionIds as string[] | undefined;
    const options = data.options as ProductOptionInput[] | undefined;
    const variants = data.variants as ProductVariantInput[] | undefined;
    delete data.collectionIds;
    delete data.options;
    delete data.variants;

    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) {
      data.description = fillLocalized(data.description as Record<string, string>);
    }

    const legacyCollectionId = data.collectionId;
    if (legacyCollectionId === '' || legacyCollectionId === '__none__') {
      data.collectionId = null;
    }

    if (collectionIds && collectionIds.length > 0) {
      data.collectionId = collectionIds[0];
    }

    const product = await sequelize.transaction(async (transaction) => {
      const created = await Product.create(
        { id, ...data } as Product['_creationAttributes'],
        { transaction },
      );
      await syncProductCollections(
        id,
        collectionIds ?? (data.collectionId ? [data.collectionId as string] : []),
        transaction,
      );
      await syncProductMatrix(id, options, variants, transaction);
      return created;
    });

    return this.getBySlugOrId(product.id);
  }

  async update(id: string, data: Record<string, unknown>) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');

    const collectionIds = data.collectionIds as string[] | undefined;
    const options = data.options as ProductOptionInput[] | undefined;
    const variants = data.variants as ProductVariantInput[] | undefined;
    delete data.collectionIds;
    delete data.options;
    delete data.variants;

    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) {
      data.description = fillLocalized(data.description as Record<string, string>);
    }

    const legacyCollectionId = data.collectionId;
    if (legacyCollectionId === '' || legacyCollectionId === '__none__') {
      data.collectionId = null;
    }

    if (collectionIds !== undefined) {
      data.collectionId = collectionIds[0] ?? null;
    }

    await sequelize.transaction(async (transaction) => {
      await product.update(data, { transaction });
      if (collectionIds !== undefined) {
        await syncProductCollections(id, collectionIds, transaction);
      } else if (data.collectionId !== undefined && data.collectionId) {
        await syncProductCollections(id, [data.collectionId as string], transaction);
      }
      await syncProductMatrix(id, options, variants, transaction);
    });

    return this.getBySlugOrId(id);
  }

  async delete(id: string) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');
    await sequelize.transaction(async (transaction) => {
      await clearProductMatrix(id, transaction);
      await ProductCollection.destroy({ where: { productId: id }, transaction });
      await product.destroy({ transaction });
    });
  }
}

export const productService = new ProductService();
