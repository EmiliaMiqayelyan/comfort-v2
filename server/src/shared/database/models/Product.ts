import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductAttributes {
  id: string;
  slug: string;
  sku: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  categoryId: string;
  collectionId: string | null;
  images: string[];
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

export class Product extends Model<ProductAttributes> implements ProductAttributes {
  declare id: string;
  declare slug: string;
  declare sku: string;
  declare name: Record<string, string>;
  declare description: Record<string, string> | null;
  declare categoryId: string;
  declare collectionId: string | null;
  declare images: string[];
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
}

Product.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    sku: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    name: { type: DataTypes.JSON, allowNull: false },
    description: { type: DataTypes.JSON, allowNull: true },
    categoryId: { type: DataTypes.CHAR(36), allowNull: false },
    collectionId: { type: DataTypes.CHAR(36), allowNull: true },
    images: { type: DataTypes.JSON, defaultValue: [] },
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
  { sequelize, tableName: 'products', modelName: 'Product' },
);
