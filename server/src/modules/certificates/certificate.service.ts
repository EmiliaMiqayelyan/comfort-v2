import { Certificate } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class CertificateService {
  async list() {
    return Certificate.findAll({ order: [['createdAt', 'DESC']] });
  }

  async getById(id: string) {
    const item = await Certificate.findByPk(id);
    if (!item) throw AppError.notFound('Certificate not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    return Certificate.create({ id, ...data } as Certificate['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Certificate.findByPk(id);
    if (!item) throw AppError.notFound('Certificate not found');
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Certificate.findByPk(id);
    if (!item) throw AppError.notFound('Certificate not found');
    await item.destroy();
  }
}

export const certificateService = new CertificateService();
