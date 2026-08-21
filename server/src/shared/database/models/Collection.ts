import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CollectionAttributes {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  image: string | null;
  style: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Collection extends Model<CollectionAttributes> implements CollectionAttributes {
  declare id: string;
  declare slug: string;
  declare name: Record<string, string>;
  declare description: Record<string, string> | null;
  declare image: string | null;
  declare style: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare dataValues: CollectionAttributes & { product_count?: number };
}

Collection.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    name: { type: DataTypes.JSON, allowNull: false },
    description: { type: DataTypes.JSON, allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
    style: { type: DataTypes.STRING(80), allowNull: true },
  },
  { sequelize, tableName: 'collections', modelName: 'Collection' },
);
