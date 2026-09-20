import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductVariantOptionAttributes {
  variantId: string;
  optionValueId: string;
  createdAt?: Date;
}

export class ProductVariantOption
  extends Model<ProductVariantOptionAttributes>
  implements ProductVariantOptionAttributes
{
  declare variantId: string;
  declare optionValueId: string;
  declare readonly createdAt: Date;
}

ProductVariantOption.init(
  {
    variantId: { type: DataTypes.CHAR(36), primaryKey: true },
    optionValueId: { type: DataTypes.CHAR(36), primaryKey: true },
  },
  {
    sequelize,
    tableName: 'product_variant_options',
    modelName: 'ProductVariantOption',
    updatedAt: false,
  },
);
