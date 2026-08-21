import { Request, Response } from 'express';
import { createCategoryDto, updateCategoryDto } from './category.dto';
import { categoryService } from './category.service';
import { param } from '../../shared/utils/param';

export class CategoryController {
  async list(_req: Request, res: Response) {
    res.json(await categoryService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await categoryService.getBySlugOrId(param(req.params.slug)));
  }

  async create(req: Request, res: Response) {
    const data = createCategoryDto.parse(req.body);
    res.status(201).json(await categoryService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateCategoryDto.parse(req.body);
    res.json(await categoryService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await categoryService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const categoryController = new CategoryController();
