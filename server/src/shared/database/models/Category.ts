import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CategoryAttributes {
  id: string;
  slug: string;
  name: Record<string, string>;
  description: Record<string, string> | null;
  image: string | null;
  parentId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  declare id: string;
  declare slug: string;
  declare name: Record<string, string>;
  declare description: Record<string, string> | null;
  declare image: string | null;
  declare parentId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare dataValues: CategoryAttributes & { product_count?: number };
}

Category.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    name: { type: DataTypes.JSON, allowNull: false },
    description: { type: DataTypes.JSON, allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
    parentId: { type: DataTypes.CHAR(36), allowNull: true },
  },
  { sequelize, tableName: 'categories', modelName: 'Category' },
);
