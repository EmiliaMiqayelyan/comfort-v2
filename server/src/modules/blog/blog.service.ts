import { BlogPost } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class BlogService {
  async list() {
    return BlogPost.findAll({ order: [['publishedAt', 'DESC']] });
  }

  async getBySlugOrId(slugOrId: string) {
    const item =
      (await BlogPost.findOne({ where: { slug: slugOrId } })) ??
      (await BlogPost.findByPk(slugOrId));
    if (!item) throw AppError.notFound('Blog post not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    if (data.excerpt) data.excerpt = fillLocalized(data.excerpt as Record<string, string>);
    if (data.content) data.content = fillLocalized(data.content as Record<string, string>);
    return BlogPost.create({ id, ...data } as BlogPost['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await BlogPost.findByPk(id);
    if (!item) throw AppError.notFound('Blog post not found');
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    if (data.excerpt) data.excerpt = fillLocalized(data.excerpt as Record<string, string>);
    if (data.content) data.content = fillLocalized(data.content as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await BlogPost.findByPk(id);
    if (!item) throw AppError.notFound('Blog post not found');
    await item.destroy();
  }
}

export const blogService = new BlogService();
