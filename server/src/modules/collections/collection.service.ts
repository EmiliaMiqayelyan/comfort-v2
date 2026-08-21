import { literal } from 'sequelize';
import { Collection, Product } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';
import { sequelize } from '../../shared/database/sequelize';

export class CollectionService {
  async list() {
    return Collection.findAll({
      attributes: {
        include: [
          [
            literal('(SELECT COUNT(*) FROM products WHERE products.collection_id = Collection.id)'),
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
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    return Collection.create({ id, ...data } as Collection['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Collection.findByPk(id);
    if (!item) throw AppError.notFound('Collection not found');
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Collection.findByPk(id);
    if (!item) throw AppError.notFound('Collection not found');

    await sequelize.transaction(async (transaction) => {
      await Product.update(
        { collectionId: null },
        { where: { collectionId: id }, transaction },
      );
      await item.destroy({ transaction });
    });
  }
}

export const collectionService = new CollectionService();
