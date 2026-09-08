import { literal } from 'sequelize';
import { Collection, Product, ProductCollection } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';
import { sequelize } from '../../shared/database/sequelize';

function normalizeCollectionPayload(data: Record<string, unknown>) {
  if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
  if (data.description) data.description = fillLocalized(data.description as Record<string, string>);

  const images = Array.isArray(data.images) ? (data.images as string[]) : [];
  const galleryVariants = Array.isArray(data.galleryVariants) ? data.galleryVariants : [];
  if (!data.image && images.length > 0) {
    data.image = images[0];
  } else if (data.image && images.length === 0) {
    data.images = [data.image as string];
  }

  if (Array.isArray(data.galleryVariants) && galleryVariants.length > 0 && images.length === 0) {
    const firstImage = (galleryVariants[0] as { imageUrl?: string })?.imageUrl;
    if (firstImage) {
      data.images = [firstImage];
      if (!data.image) data.image = firstImage;
    }
  }

  return data;
}

export class CollectionService {
  async list() {
    return Collection.findAll({
      attributes: {
        include: [
          [
            literal(
              '(SELECT COUNT(*) FROM product_collections WHERE product_collections.collection_id = Collection.id)',
            ),
            'product_count',
          ],
        ],
      },
      order: [['createdAt', 'ASC']],
    });
  }

  async getBySlugOrId(slugOrId: string) {
    const item =
      (await Collection.findOne({ where: { slug: slugOrId } })) ??
      (await Collection.findByPk(slugOrId));
    if (!item) throw AppError.notFound('Collection not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    normalizeCollectionPayload(data);
    if (!data.sku) data.sku = `col-${data.slug}`;
    return Collection.create({ id, ...data } as Collection['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Collection.findByPk(id);
    if (!item) throw AppError.notFound('Collection not found');
    normalizeCollectionPayload(data);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Collection.findByPk(id);
    if (!item) throw AppError.notFound('Collection not found');

    await sequelize.transaction(async (transaction) => {
      await ProductCollection.destroy({ where: { collectionId: id }, transaction });
      await Product.update({ collectionId: null }, { where: { collectionId: id }, transaction });
      await item.destroy({ transaction });
    });
  }

  async getProductIds(collectionId: string): Promise<string[]> {
    const rows = await ProductCollection.findAll({
      where: { collectionId },
      attributes: ['productId'],
    });
    return rows.map((row) => row.productId);
  }
}

export const collectionService = new CollectionService();
