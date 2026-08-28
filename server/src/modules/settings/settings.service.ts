import { SiteSetting } from '../../shared/database/models';

const emptyLocalized = { en: '', ru: '', am: '' };

const DEFAULT_CONTACT = {
  phones: [] as string[],
  emails: [] as string[],
  address: { ...emptyLocalized },
  hours: { ...emptyLocalized },
  socials: [] as Array<{ id: string; label: string; href: string }>,
  showrooms: [] as Array<{
    id: string;
    name: string;
    address: string;
    hours: string;
    phone?: string;
  }>,
};

const DEFAULT_HERO_IMAGES = [
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80',
];

type ContactValue = typeof DEFAULT_CONTACT & Record<string, unknown>;

type HeroValue = {
  images: string[];
  image: string;
};

function normalizeContact(value: Record<string, unknown> | null | undefined): ContactValue {
  const raw = value ?? {};
  const phones = Array.isArray(raw.phones)
    ? (raw.phones as string[])
    : typeof raw.phone === 'string' && raw.phone
      ? [raw.phone]
      : [];
  const emails = Array.isArray(raw.emails)
    ? (raw.emails as string[])
    : typeof raw.email === 'string' && raw.email
      ? [raw.email]
      : [];
  const address =
    raw.address && typeof raw.address === 'object'
      ? { ...emptyLocalized, ...(raw.address as object) }
      : { ...emptyLocalized };
  const hoursSource =
    raw.hours && typeof raw.hours === 'object'
      ? raw.hours
      : raw.workingHours && typeof raw.workingHours === 'object'
        ? raw.workingHours
        : emptyLocalized;
  const hours = { ...emptyLocalized, ...(hoursSource as object) };

  return {
    phones,
    emails,
    address,
    hours,
    socials: Array.isArray(raw.socials) ? (raw.socials as ContactValue['socials']) : [],
    showrooms: Array.isArray(raw.showrooms) ? (raw.showrooms as ContactValue['showrooms']) : [],
  };
}

function normalizeHero(value: Record<string, unknown> | null | undefined): HeroValue {
  const raw = value ?? {};
  const fromArray = Array.isArray(raw.images)
    ? raw.images
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const fromSingle = typeof raw.image === 'string' ? raw.image.trim() : '';
  const images =
    fromArray.length > 0
      ? fromArray
      : fromSingle
        ? [fromSingle]
        : [...DEFAULT_HERO_IMAGES];

  return {
    images,
    image: images[0],
  };
}

export class SettingsService {
  async getContact() {
    const row = await SiteSetting.findByPk('contact');
    return normalizeContact(row?.settingValue as Record<string, unknown> | undefined);
  }

  async updateContact(value: Record<string, unknown>) {
    const normalized = normalizeContact(value);
    const [row, created] = await SiteSetting.findOrCreate({
      where: { settingKey: 'contact' },
      defaults: { settingKey: 'contact', settingValue: normalized },
    });
    if (!created) {
      row.settingValue = normalized;
      row.changed('settingValue', true);
      await row.save();
    }
    return row.settingValue;
  }

  async getHero() {
    const row = await SiteSetting.findByPk('hero');
    return normalizeHero(row?.settingValue as Record<string, unknown> | undefined);
  }

  async updateHero(value: Record<string, unknown>) {
    const normalized = normalizeHero(value);
    const [row, created] = await SiteSetting.findOrCreate({
      where: { settingKey: 'hero' },
      defaults: { settingKey: 'hero', settingValue: normalized },
    });
    if (!created) {
      row.set('settingValue', normalized);
      row.changed('settingValue', true);
      await row.save();
    }
    return normalizeHero(row.settingValue as Record<string, unknown>);
  }
}

export const settingsService = new SettingsService();
