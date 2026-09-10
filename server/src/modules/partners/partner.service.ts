import { Partner } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { generateId } from '../../shared/utils/uuid';
import { fillLocalized } from '../../shared/utils/localized';

export class PartnerService {
  async list() {
    return Partner.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
  }

  async getById(id: string) {
    const item = await Partner.findByPk(id);
    if (!item) throw AppError.notFound('Partner not found');
    return item;
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    if (data.sortOrder == null) data.sortOrder = 0;
    return Partner.create({ id, ...data } as Partner['_creationAttributes']);
  }

  async update(id: string, data: Record<string, unknown>) {
    const item = await Partner.findByPk(id);
    if (!item) throw AppError.notFound('Partner not found');
    if (data.title) data.title = fillLocalized(data.title as Record<string, string>);
    await item.update(data);
    return item;
  }

  async delete(id: string) {
    const item = await Partner.findByPk(id);
    if (!item) throw AppError.notFound('Partner not found');
    await item.destroy();
  }
}

export const partnerService = new PartnerService();
