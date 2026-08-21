import { ContactMessage } from '../../shared/database/models';
import { generateId } from '../../shared/utils/uuid';

export class ContactService {
  async list() {
    return ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
  }

  async create(data: Record<string, unknown>) {
    const id = generateId();
    return ContactMessage.create({ id, ...data } as ContactMessage['_creationAttributes']);
  }
}

export const contactService = new ContactService();
