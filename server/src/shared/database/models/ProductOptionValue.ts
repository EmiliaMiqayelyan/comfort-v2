import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductOptionValueAttributes {
  id: string;
  optionId: string;
  label: Record<string, string>;
  value: string;
  hex: string | null;
  swatchUrl: string | null;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductOptionValue
  extends Model<ProductOptionValueAttributes>
  implements ProductOptionValueAttributes
{
  declare id: string;
  declare optionId: string;
  declare label: Record<string, string>;
  declare value: string;
  declare hex: string | null;
  declare swatchUrl: string | null;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ProductOptionValue.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    optionId: { type: DataTypes.CHAR(36), allowNull: false },
    label: { type: DataTypes.JSON, allowNull: false },
    value: { type: DataTypes.STRING(160), allowNull: false },
    hex: { type: DataTypes.STRING(20), allowNull: true },
    swatchUrl: { type: DataTypes.STRING(500), allowNull: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'product_option_values', modelName: 'ProductOptionValue' },
);
