import { Project } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class ProjectService {
  async list() {
    return Project.findAll({ order: [['year', 'DESC']] });
  }

  async getBySlugOrId(slugOrId: string) {
    const item =
      (await Project.findOne({ where: { slug: slugOrId } })) ??
      (await Project.findByPk(slugOrId));
    if (!item) throw AppError.notFound('Project not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    if (data.location) data.location = fillLocalized(data.location as Record<string, string>);
    return Project.create({ id, ...data } as Project['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Project.findByPk(id);
    if (!item) throw AppError.notFound('Project not found');
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    if (data.description) data.description = fillLocalized(data.description as Record<string, string>);
    if (data.location) data.location = fillLocalized(data.location as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Project.findByPk(id);
    if (!item) throw AppError.notFound('Project not found');
    await item.destroy();
  }
}

export const projectService = new ProjectService();
