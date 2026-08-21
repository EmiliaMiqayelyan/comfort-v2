import { Request, Response } from 'express';
import { userService } from './user.service';

export class UserController {
  async list(_req: Request, res: Response) {
    res.json(await userService.list());
  }
}

export const userController = new UserController();
