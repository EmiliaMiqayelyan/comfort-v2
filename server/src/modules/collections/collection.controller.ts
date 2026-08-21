import { Request, Response } from 'express';
import { createCollectionDto, updateCollectionDto } from './collection.dto';
import { collectionService } from './collection.service';
import { param } from '../../shared/utils/param';

export class CollectionController {
  async list(_req: Request, res: Response) {
    res.json(await collectionService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await collectionService.getBySlugOrId(param(req.params.slug)));
  }

  async create(req: Request, res: Response) {
    const data = createCollectionDto.parse(req.body);
    res.status(201).json(await collectionService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateCollectionDto.parse(req.body);
    res.json(await collectionService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await collectionService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const collectionController = new CollectionController();
