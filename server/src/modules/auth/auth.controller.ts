import { Request, Response } from 'express';
import { loginDto } from './auth.dto';
import { authService } from './auth.service';

export class AuthController {
  async login(req: Request, res: Response) {
    const data = loginDto.parse(req.body);
    const result = await authService.login(data);
    res.json(result);
  }

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    res.json(user);
  }
}

export const authController = new AuthController();
