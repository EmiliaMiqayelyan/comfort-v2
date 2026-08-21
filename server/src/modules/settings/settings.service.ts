import { SiteSetting } from '../../shared/database/models';

const DEFAULT_CONTACT = {
  phone: '',
  email: '',
  address: { en: '', ru: '', am: '' },
  workingHours: { en: '', ru: '', am: '' },
};

export class SettingsService {
  async getContact() {
    const row = await SiteSetting.findByPk('contact');
    return row ? row.settingValue : DEFAULT_CONTACT;
  }

  async updateContact(value: Record<string, unknown>) {
    const [row, created] = await SiteSetting.findOrCreate({
      where: { settingKey: 'contact' },
      defaults: { settingKey: 'contact', settingValue: value },
    });
    if (!created) {
      row.settingValue = value;
      await row.save();
    }
    return row.settingValue;
  }
}

export const settingsService = new SettingsService();
