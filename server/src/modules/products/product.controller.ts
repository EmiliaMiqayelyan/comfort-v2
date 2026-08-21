import { Request, Response } from 'express';
import { createProductDto, updateProductDto } from './product.dto';
import { productService } from './product.service';
import { param } from '../../shared/utils/param';

export class ProductController {
  async list(req: Request, res: Response) {
    const items = await productService.list(req.query as Record<string, string>);
    res.json(items);
  }

  async getOne(req: Request, res: Response) {
    const item = await productService.getBySlugOrId(param(req.params.slug));
    res.json(item);
  }

  async create(req: Request, res: Response) {
    const data = createProductDto.parse(req.body);
    const item = await productService.create(data as unknown as Record<string, unknown>);
    res.status(201).json(item);
  }

  async update(req: Request, res: Response) {
    const data = updateProductDto.parse(req.body);
    const item = await productService.update(param(req.params.id), data as unknown as Record<string, unknown>);
    res.json(item);
  }

  async delete(req: Request, res: Response) {
    await productService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const productController = new ProductController();
