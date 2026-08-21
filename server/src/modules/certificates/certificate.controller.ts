import { Request, Response } from 'express';
import { createCertificateDto, updateCertificateDto } from './certificate.dto';
import { certificateService } from './certificate.service';
import { param } from '../../shared/utils/param';

export class CertificateController {
  async list(_req: Request, res: Response) {
    res.json(await certificateService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await certificateService.getById(param(req.params.id)));
  }

  async create(req: Request, res: Response) {
    const data = createCertificateDto.parse(req.body);
    res.status(201).json(await certificateService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateCertificateDto.parse(req.body);
    res.json(await certificateService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await certificateService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const certificateController = new CertificateController();
