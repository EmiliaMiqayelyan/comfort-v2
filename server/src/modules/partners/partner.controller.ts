import { Request, Response } from 'express';
import { createPartnerDto, updatePartnerDto } from './partner.dto';
import { partnerService } from './partner.service';
import { param } from '../../shared/utils/param';

export class PartnerController {
  async list(_req: Request, res: Response) {
    res.json(await partnerService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await partnerService.getById(param(req.params.id)));
  }

  async create(req: Request, res: Response) {
    const data = createPartnerDto.parse(req.body);
    res.status(201).json(await partnerService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updatePartnerDto.parse(req.body);
    res.json(await partnerService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await partnerService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const partnerController = new PartnerController();
