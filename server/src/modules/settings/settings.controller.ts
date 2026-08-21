import { Request, Response } from 'express';
import { updateContactSettingsDto } from './settings.dto';
import { settingsService } from './settings.service';

export class SettingsController {
  async getContact(_req: Request, res: Response) {
    res.json(await settingsService.getContact());
  }

  async updateContact(req: Request, res: Response) {
    const data = updateContactSettingsDto.parse(req.body);
    res.json(await settingsService.updateContact(data));
  }
}

export const settingsController = new SettingsController();
