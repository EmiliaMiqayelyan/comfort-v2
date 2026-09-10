import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface PartnerAttributes {
  id: string;
  title: Record<string, string>;
  logo: string;
  websiteUrl: string | null;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Partner extends Model<PartnerAttributes> implements PartnerAttributes {
  declare id: string;
  declare title: Record<string, string>;
  declare logo: string;
  declare websiteUrl: string | null;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Partner.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    title: { type: DataTypes.JSON, allowNull: false },
    logo: { type: DataTypes.STRING(500), allowNull: false },
    websiteUrl: { type: DataTypes.STRING(500), allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'partners', modelName: 'Partner' },
);
