import { Request, Response } from 'express';
import { createContactDto } from './contact.dto';
import { contactService } from './contact.service';

export class ContactController {
  async list(_req: Request, res: Response) {
    res.json(await contactService.list());
  }

  async create(req: Request, res: Response) {
    const data = createContactDto.parse(req.body);
    res.status(201).json(await contactService.create(data as unknown as Record<string, unknown>));
  }
}

export const contactController = new ContactController();
