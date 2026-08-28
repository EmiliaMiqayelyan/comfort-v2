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

function parseSettingValue(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return {};
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeContact(value: Record<string, unknown> | null | undefined): ContactValue {
  const raw = parseSettingValue(value);
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
  const raw = parseSettingValue(value);
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

async function upsertSetting(key: string, value: Record<string, unknown>) {
  const existing = await SiteSetting.findByPk(key);
  if (existing) {
    await existing.update({ settingValue: value });
    return existing.settingValue;
  }
  const created = await SiteSetting.create({ settingKey: key, settingValue: value });
  return created.settingValue;
}

export class SettingsService {
  async getContact() {
    const row = await SiteSetting.findByPk('contact');
    return normalizeContact(row?.settingValue);
  }

  async updateContact(value: Record<string, unknown>) {
    const normalized = normalizeContact(value);
    await upsertSetting('contact', normalized);
    return this.getContact();
  }

  async getHero() {
    const row = await SiteSetting.findByPk('hero');
    return normalizeHero(row?.settingValue);
  }

  async updateHero(value: Record<string, unknown>) {
    const normalized = normalizeHero(value);
    await upsertSetting('hero', normalized);
    return this.getHero();
  }
}

export const settingsService = new SettingsService();
