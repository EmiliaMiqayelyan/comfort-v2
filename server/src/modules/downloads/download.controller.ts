import { Request, Response } from 'express';
import { createDownloadDto, updateDownloadDto } from './download.dto';
import { downloadService } from './download.service';
import { param } from '../../shared/utils/param';

export class DownloadController {
  async list(req: Request, res: Response) {
    const publicOnly = req.query.public === 'true';
    res.json(await downloadService.list(publicOnly));
  }

  async getOne(req: Request, res: Response) {
    res.json(await downloadService.getById(param(req.params.id)));
  }

  async create(req: Request, res: Response) {
    const data = createDownloadDto.parse(req.body);
    res.status(201).json(await downloadService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateDownloadDto.parse(req.body);
    res.json(await downloadService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await downloadService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const downloadController = new DownloadController();
