import { Request, Response } from 'express';
import { updateContactSettingsDto, updateHeroSettingsDto } from './settings.dto';
import { settingsService } from './settings.service';

export class SettingsController {
  async getContact(_req: Request, res: Response) {
    res.json(await settingsService.getContact());
  }

  async updateContact(req: Request, res: Response) {
    const data = updateContactSettingsDto.parse(req.body);
    res.json(await settingsService.updateContact(data));
  }

  async getHero(_req: Request, res: Response) {
    res.json(await settingsService.getHero());
  }

  async updateHero(req: Request, res: Response) {
    const data = updateHeroSettingsDto.parse(req.body);
    res.json(await settingsService.updateHero(data));
  }
}

export const settingsController = new SettingsController();
