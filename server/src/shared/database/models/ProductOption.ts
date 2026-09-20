import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductOptionAttributes {
  id: string;
  productId: string;
  key: string;
  label: Record<string, string>;
  uiType: 'buttons' | 'swatches';
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductOption
  extends Model<ProductOptionAttributes>
  implements ProductOptionAttributes
{
  declare id: string;
  declare productId: string;
  declare key: string;
  declare label: Record<string, string>;
  declare uiType: 'buttons' | 'swatches';
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ProductOption.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    productId: { type: DataTypes.CHAR(36), allowNull: false },
    key: { type: DataTypes.STRING(80), allowNull: false },
    label: { type: DataTypes.JSON, allowNull: false },
    uiType: {
      type: DataTypes.ENUM('buttons', 'swatches'),
      allowNull: false,
      defaultValue: 'buttons',
    },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'product_options', modelName: 'ProductOption' },
);
