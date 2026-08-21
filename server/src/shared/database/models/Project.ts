import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProjectAttributes {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string> | null;
  location: Record<string, string> | null;
  year: number | null;
  images: string[];
  beforeImage: string | null;
  afterImage: string | null;
  videoUrl: string | null;
  productIds: string[];
  category: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  declare id: string;
  declare slug: string;
  declare title: Record<string, string>;
  declare description: Record<string, string> | null;
  declare location: Record<string, string> | null;
  declare year: number | null;
  declare images: string[];
  declare beforeImage: string | null;
  declare afterImage: string | null;
  declare videoUrl: string | null;
  declare productIds: string[];
  declare category: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Project.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    title: { type: DataTypes.JSON, allowNull: false },
    description: { type: DataTypes.JSON, allowNull: true },
    location: { type: DataTypes.JSON, allowNull: true },
    year: { type: DataTypes.SMALLINT, allowNull: true },
    images: { type: DataTypes.JSON, defaultValue: [] },
    beforeImage: { type: DataTypes.STRING(500), allowNull: true },
    afterImage: { type: DataTypes.STRING(500), allowNull: true },
    videoUrl: { type: DataTypes.STRING(500), allowNull: true },
    productIds: { type: DataTypes.JSON, defaultValue: [] },
    category: { type: DataTypes.STRING(80), allowNull: true },
  },
  { sequelize, tableName: 'projects', modelName: 'Project' },
);
