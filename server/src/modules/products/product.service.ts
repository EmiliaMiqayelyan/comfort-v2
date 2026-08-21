import { Op, literal } from 'sequelize';
import { Product, Category, Collection } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class ProductService {
  async list(query: Record<string, string | undefined>) {
    const where: Record<string, unknown> = {};

    if (query.featured === 'true') where.featured = 1;

    if (query.category) {
      const cat = await Category.findOne({ where: { slug: query.category } });
      if (cat) {
        const children = await Category.findAll({ where: { parentId: cat.id }, attributes: ['id'] });
        const ids = [cat.id, ...children.map(c => c.id)];
        where.categoryId = { [Op.in]: ids };
      }
    }

    if (query.collection) {
      const col = await Collection.findOne({ where: { slug: query.collection } });
      if (col) where.collectionId = col.id;
    }

    if (query.q) {
      const term = `%${query.q}%`;
      where[Op.or as unknown as string] = [
        { sku: { [Op.like]: term } },
        { slug: { [Op.like]: term } },
        literal(`JSON_UNQUOTE(JSON_EXTRACT(name, '$.en')) LIKE ${Product.sequelize!.escape(term)}`),
      ];
    }

    return Product.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async getBySlugOrId(slugOrId: string) {
    const product =
      (await Product.findOne({ where: { slug: slugOrId } })) ??
      (await Product.findByPk(slugOrId));
    if (!product) throw AppError.notFound('Product not found');
    return product;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    const collectionId = data.collectionId;
    if (collectionId === '' || collectionId === '__none__') data.collectionId = null;
    return Product.create({ id, ...data } as Product['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    const collectionId = data.collectionId;
    if (collectionId === '' || collectionId === '__none__') data.collectionId = null;
    await product.update(data);
    return product;
  }

  async delete(id: string) {
    const product = await Product.findByPk(id);
    if (!product) throw AppError.notFound('Product not found');
    await product.destroy();
  }
}

export const productService = new ProductService();
