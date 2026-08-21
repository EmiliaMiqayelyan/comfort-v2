import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface SiteSettingAttributes {
  settingKey: string;
  settingValue: Record<string, unknown>;
}

export class SiteSetting extends Model<SiteSettingAttributes> implements SiteSettingAttributes {
  declare settingKey: string;
  declare settingValue: Record<string, unknown>;
}

SiteSetting.init(
  {
    settingKey: { type: DataTypes.STRING(80), primaryKey: true },
    settingValue: { type: DataTypes.JSON, allowNull: false },
  },
  { sequelize, tableName: 'site_settings', modelName: 'SiteSetting', timestamps: false },
);
