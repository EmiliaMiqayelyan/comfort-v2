import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CollectionAttributes {
  id: string;
  slug: string;
  sku: string | null;
  name: Record<string, string>;
  description: Record<string, string> | null;
  image: string | null;
  style: string | null;
  images: string[];
  galleryVariants: unknown[];
  modelUrl: string | null;
  videoUrl: string | null;
  height: number;
  width: number;
  depth: number;
  length: number;
  material: string | null;
  finish: string | null;
  colors: unknown[];
  textures: unknown[];
  specs: unknown[];
  downloads: unknown[];
  price: number;
  featured: boolean;
  availability: 'in_stock' | 'limited' | 'preorder';
  createdAt?: Date;
  updatedAt?: Date;
}

export class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  declare id: string;
  declare slug: string;
  declare sku: string | null;
  declare name: Record<string, string>;
  declare description: Record<string, string> | null;
  declare image: string | null;
  declare style: string | null;
  declare images: string[];
  declare galleryVariants: unknown[];
  declare modelUrl: string | null;
  declare videoUrl: string | null;
  declare height: number;
  declare width: number;
  declare depth: number;
  declare length: number;
  declare material: string | null;
  declare finish: string | null;
  declare colors: unknown[];
  declare textures: unknown[];
  declare specs: unknown[];
  declare downloads: unknown[];
  declare price: number;
  declare featured: boolean;
  declare availability: 'in_stock' | 'limited' | 'preorder';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare dataValues: CollectionAttributes & { product_count?: number };
}

Collection.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    sku: { type: DataTypes.STRING(80), allowNull: true, unique: true },
    name: { type: DataTypes.JSON, allowNull: false },
    description: { type: DataTypes.JSON, allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
    style: { type: DataTypes.STRING(80), allowNull: true },
    images: { type: DataTypes.JSON, defaultValue: [] },
    galleryVariants: { type: DataTypes.JSON, defaultValue: [] },
    modelUrl: { type: DataTypes.STRING(500), allowNull: true },
    videoUrl: { type: DataTypes.STRING(500), allowNull: true },
    height: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    width: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    depth: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    length: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    material: { type: DataTypes.STRING(160), allowNull: true },
    finish: { type: DataTypes.STRING(160), allowNull: true },
    colors: { type: DataTypes.JSON, defaultValue: [] },
    textures: { type: DataTypes.JSON, defaultValue: [] },
    specs: { type: DataTypes.JSON, defaultValue: [] },
    downloads: { type: DataTypes.JSON, defaultValue: [] },
    price: { type: DataTypes.INTEGER, defaultValue: 0 },
    featured: { type: DataTypes.TINYINT, defaultValue: 0 },
    availability: {
      type: DataTypes.ENUM('in_stock', 'limited', 'preorder'),
      defaultValue: 'in_stock',
    },
  },
  { sequelize, tableName: 'collections', modelName: 'Collection' },
);
