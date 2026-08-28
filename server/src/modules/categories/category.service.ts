import { Category, Product } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

type CategoryRow = {
  id: string;
  parentId?: string | null;
};

function descendantIds(categoryId: string, categories: CategoryRow[]): string[] {
  const ids: string[] = [];
  const walk = (parentId: string) => {
    for (const child of categories.filter((category) => category.parentId === parentId)) {
      ids.push(child.id);
      walk(child.id);
    }
  };
  walk(categoryId);
  return ids;
}

function assertValidParent(
  categoryId: string | undefined,
  parentId: string | null | undefined,
  categories: CategoryRow[],
) {
  if (!parentId) return;
  if (categoryId && parentId === categoryId) {
    throw new AppError('Category cannot be its own parent');
  }
  if (categoryId && isDescendantOf(parentId, categoryId, categories)) {
    throw new AppError('Parent category cannot be a subcategory of this category');
  }
}

function isDescendantOf(
  categoryId: string,
  ancestorId: string,
  categories: CategoryRow[],
): boolean {
  let current = categories.find((category) => category.id === categoryId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = categories.find((category) => category.id === current!.parentId);
  }
  return false;
}

export class CategoryService {
  private async attachProductCounts(categories: Category[]) {
    const rows = categories.map((category) => category.toJSON() as CategoryRow);
    const products = await Product.findAll({ attributes: ['categoryId'], raw: true });
    const countByCategory = new Map<string, number>();

    for (const product of products) {
      const categoryId = product.categoryId as string | null | undefined;
      if (!categoryId) continue;
      countByCategory.set(categoryId, (countByCategory.get(categoryId) ?? 0) + 1);
    }

    return categories.map((category) => {
      const json = category.toJSON();
      const ids = [category.id, ...descendantIds(category.id, rows)];
      const productCount = ids.reduce((sum, id) => sum + (countByCategory.get(id) ?? 0), 0);
      return { ...json, productCount };
    });
  }

  async list() {
    const categories = await Category.findAll({ order: [['createdAt', 'ASC']] });
    return this.attachProductCounts(categories);
  }

  async getBySlugOrId(slugOrId: string) {
    const item =
      (await Category.findOne({ where: { slug: slugOrId } })) ??
      (await Category.findByPk(slugOrId));
    if (!item) throw AppError.notFound('Category not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const slug = String(data.slug ?? '').trim();
    if (!slug) throw new AppError('Slug is required');

    const existing = await Category.findOne({ where: { slug } });
    if (existing) throw AppError.conflict('Slug already exists');

    const parentId = data.parentId as string | null | undefined;
    const categories = await Category.findAll({ attributes: ['id', 'parentId'], raw: true });
    assertValidParent(undefined, parentId, categories);

    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) throw new AppError('Parent category not found');
    }

    const id = generateId();
    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) {
      const description = fillLocalized(data.description as Record<string, string>);
      data.description = description.en || description.ru || description.am ? description : null;
    }
    return Category.create({ id, ...data, slug } as Category['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Category.findByPk(id);
    if (!item) throw AppError.notFound('Category not found');

    if ('slug' in data && data.slug) {
      const slug = String(data.slug).trim();
      const existing = await Category.findOne({ where: { slug } });
      if (existing && existing.id !== id) throw AppError.conflict('Slug already exists');
      data.slug = slug;
    }

    if ('parentId' in data) {
      const categories = await Category.findAll({ attributes: ['id', 'parentId'], raw: true });
      assertValidParent(id, data.parentId as string | null | undefined, categories);

      const parentId = data.parentId as string | null | undefined;
      if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) throw new AppError('Parent category not found');
      }
    }

    if (data.name) data.name = fillLocalized(data.name as Record<string, string>);
    if (data.description) {
      const description = fillLocalized(data.description as Record<string, string>);
      data.description = description.en || description.ru || description.am ? description : null;
    }
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
