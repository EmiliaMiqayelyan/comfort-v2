import { DownloadFile } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class DownloadService {
  async list(publicOnly: boolean) {
    const where: Record<string, unknown> = {};
    if (publicOnly) where.downloadable = 1;
    return DownloadFile.findAll({ where, order: [['createdAt', 'DESC']] });
  }

  async getById(id: string) {
    const item = await DownloadFile.findByPk(id);
    if (!item) throw AppError.notFound('Download not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    return DownloadFile.create({ id, ...data } as DownloadFile['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await DownloadFile.findByPk(id);
    if (!item) throw AppError.notFound('Download not found');
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await DownloadFile.findByPk(id);
    if (!item) throw AppError.notFound('Download not found');
    await item.destroy();
  }
}

export const downloadService = new DownloadService();
