import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ProductCollectionAttributes {
  productId: string;
  collectionId: string;
  createdAt?: Date;
}

export class ProductCollection
  extends Model<ProductCollectionAttributes>
  implements ProductCollectionAttributes
{
  declare productId: string;
  declare collectionId: string;
  declare readonly createdAt: Date;
}

ProductCollection.init(
  {
    productId: { type: DataTypes.CHAR(36), primaryKey: true },
    collectionId: { type: DataTypes.CHAR(36), primaryKey: true },
  },
  { sequelize, tableName: 'product_collections', modelName: 'ProductCollection', updatedAt: false },
);
