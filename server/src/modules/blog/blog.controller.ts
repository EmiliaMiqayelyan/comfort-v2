import { Request, Response } from 'express';
import { createBlogDto, updateBlogDto } from './blog.dto';
import { blogService } from './blog.service';
import { param } from '../../shared/utils/param';

export class BlogController {
  async list(_req: Request, res: Response) {
    res.json(await blogService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await blogService.getBySlugOrId(param(req.params.slug)));
  }

  async create(req: Request, res: Response) {
    const data = createBlogDto.parse(req.body);
    res.status(201).json(await blogService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateBlogDto.parse(req.body);
    res.json(await blogService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await blogService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const blogController = new BlogController();
