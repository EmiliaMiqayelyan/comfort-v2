import { literal } from 'sequelize';
import { Category, Product } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';
import { sequelize } from '../../shared/database/sequelize';

export class CategoryService {
  async list() {
    const categories = await Category.findAll({
      attributes: {
        include: [
          [
            literal(`(
              SELECT COUNT(*) FROM products
              WHERE products.category_id = Category.id
              OR products.category_id IN (SELECT c2.id FROM categories c2 WHERE c2.parent_id = Category.id)
            )`),
            'product_count',
          ],
        ],
      },
      order: [['createdAt', 'ASC']],
    });
    return categories;
  }

  async getBySlugOrId(slugOrId: string) {
    const item =
      (await Category.findOne({ where: { slug: slugOrId } })) ??
      (await Category.findByPk(slugOrId));
    if (!item) throw AppError.notFound('Category not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    return Category.create({ id, ...data } as Category['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Category.findByPk(id);
    if (!item) throw AppError.notFound('Category not found');
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Category.findByPk(id);
    if (!item) throw AppError.notFound('Category not found');
    await item.destroy();
  }
}

export const categoryService = new CategoryService();
