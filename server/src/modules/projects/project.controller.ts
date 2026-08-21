import { Request, Response } from 'express';
import { createProjectDto, updateProjectDto } from './project.dto';
import { projectService } from './project.service';
import { param } from '../../shared/utils/param';

export class ProjectController {
  async list(_req: Request, res: Response) {
    res.json(await projectService.list());
  }

  async getOne(req: Request, res: Response) {
    res.json(await projectService.getBySlugOrId(param(req.params.slug)));
  }

  async create(req: Request, res: Response) {
    const data = createProjectDto.parse(req.body);
    res.status(201).json(await projectService.create(data as unknown as Record<string, unknown>));
  }

  async update(req: Request, res: Response) {
    const data = updateProjectDto.parse(req.body);
    res.json(await projectService.update(param(req.params.id), data as unknown as Record<string, unknown>));
  }

  async delete(req: Request, res: Response) {
    await projectService.delete(param(req.params.id));
    res.json({ message: 'Deleted' });
  }
}

export const projectController = new ProjectController();
