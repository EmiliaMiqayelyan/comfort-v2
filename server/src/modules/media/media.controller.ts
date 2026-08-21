import { Request, Response } from 'express';
import { mediaService } from './media.service';
import { AppError } from '../../shared/errors/AppError';

export class MediaController {
  async list(_req: Request, res: Response) {
    res.json(await mediaService.list());
  }

  async upload(req: Request, res: Response) {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const asset = await mediaService.createFromUpload(req.file);
    res.status(201).json(asset);
  }
}

export const mediaController = new MediaController();
