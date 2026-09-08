import { Op, literal, type Transaction } from 'sequelize';
import { Product, Category, Collection, ProductCollection } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';
import { sequelize } from '../../shared/database/sequelize';

function attachCollectionIds(product: Product) {
  const plain = product.toJSON() as unknown as Record<string, unknown>;
  const collections = (product as Product & { collections?: Collection[] }).collections;
  const collectionIds = collections?.map((collection) => collection.id) ?? [];
  if (collectionIds.length === 0 && product.collectionId) {
    collectionIds.push(product.collectionId);
  }
  plain.collectionIds = collectionIds;
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

export class ProductService {
  async list(query: Record<string, string | undefined>) {
    const where: Record<string, unknown> = {};

    if (query.featured === 'true') where.featured = 1;

    if (query.category) {
      const cat = await Category.findOne({ where: { slug: query.category } });
      if (cat) {
        const children = await Category.findAll({ where: { parentId: cat.id }, attributes: ['id'] });
        const ids = [cat.id, ...children.map((c) => c.id)];
        where.categoryId = { [Op.in]: ids };
      }
    }

    if (query.collection) {
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

    if (query.q) {
      const term = `%${query.q}%`;
      where[Op.or as unknown as string] = [
        { sku: { [Op.like]: term } },
        { slug: { [Op.like]: term } },
        literal(`JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ${Product.sequelize!.escape(term)}`),
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Collection, as: 'collections', attributes: ['id'], through: { attributes: [] } }],
      order: [['createdAt', 'DESC']],
    });

    return products.map(attachCollectionIds);
  }

  async getBySlugOrId(slugOrId: string) {
    const product =
      (await Product.findOne({
        where: { slug: slugOrId },
        include: [{ model: Collection, as: 'collections', attributes: ['id'], through: { attributes: [] } }],
      })) ??
      (await Product.findByPk(slugOrId, {
        include: [{ model: Collection, as: 'collections', attributes: ['id'], through: { attributes: [] } }],
      }));
    if (!product) throw AppError.notFound('Product not found');
    return attachCollectionIds(product);
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    const collectionIds = data.collectionIds as string[] | undefined;
    delete data.collectionIds;

    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);

    const legacyCollectionId = data.collectionId;
    if (legacyCollectionId === '' || legacyCollectionId === '__none__') data.collectionId = null;

    if (collectionIds && collectionIds.length > 0) {
      data.collectionId = collectionIds[0];
    }

    const product = await sequelize.transaction(async (transaction) => {
      const created = await Product.create({ id, ...data } as Product['_creationAttributes'], {
        transaction,
      });
      await syncProductCollections(id, collectionIds ?? (data.collectionId ? [data.collectionId as string] : []), transaction);
      return created;
    });

    return this.getBySlugOrId(product.id);
  }

  async update(id: string, data: Record<string, unknown>) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');

    const collectionIds = data.collectionIds as string[] | undefined;
    delete data.collectionIds;

    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);

    const legacyCollectionId = data.collectionId;
    if (legacyCollectionId === '' || legacyCollectionId === '__none__') data.collectionId = null;

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
    });

    return this.getBySlugOrId(id);
  }

  async delete(id: string) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');
    await sequelize.transaction(async (transaction) => {
      await ProductCollection.destroy({ where: { productId: id }, transaction });
      await product.destroy({ transaction });
    });
  }
}

export const productService = new ProductService();
