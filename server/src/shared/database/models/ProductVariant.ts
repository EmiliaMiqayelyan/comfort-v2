import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export type VariantAvailability = 'in_stock' | 'limited' | 'preorder';

export interface ProductVariantAttributes {
  id: string;
  productId: string;
  sku: string;
  imageUrl: string | null;
  thumbUrl: string | null;
  images: string[] | null;
  textureMapUrl: string | null;
  texturePreviewUrl: string | null;
  price: number | null;
  availability: VariantAvailability | null;
  height: number | null;
  width: number | null;
  depth: number | null;
  length: number | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductVariant
  extends Model<ProductVariantAttributes>
  implements ProductVariantAttributes
{
  declare id: string;
  declare productId: string;
  declare sku: string;
  declare imageUrl: string | null;
  declare thumbUrl: string | null;
  declare images: string[] | null;
  declare textureMapUrl: string | null;
  declare texturePreviewUrl: string | null;
  declare price: number | null;
  declare availability: VariantAvailability | null;
  declare height: number | null;
  declare width: number | null;
  declare depth: number | null;
  declare length: number | null;
  declare isDefault: boolean;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ProductVariant.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    productId: { type: DataTypes.CHAR(36), allowNull: false },
    sku: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    imageUrl: { type: DataTypes.STRING(500), allowNull: true },
    thumbUrl: { type: DataTypes.STRING(500), allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    textureMapUrl: { type: DataTypes.STRING(500), allowNull: true },
    texturePreviewUrl: { type: DataTypes.STRING(500), allowNull: true },
    price: { type: DataTypes.INTEGER, allowNull: true },
    availability: {
      type: DataTypes.ENUM('in_stock', 'limited', 'preorder'),
      allowNull: true,
    },
    height: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    width: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    depth: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    length: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    isDefault: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'product_variants', modelName: 'ProductVariant' },
);
