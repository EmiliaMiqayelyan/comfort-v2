import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'editor' | 'translator' | 'dealer';
  avatar: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: 'admin' | 'manager' | 'editor' | 'translator' | 'dealer';
  declare avatar: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'editor', 'translator', 'dealer'),
      defaultValue: 'editor',
    },
    avatar: { type: DataTypes.STRING(500), allowNull: true },
  },
  { sequelize, tableName: 'users', modelName: 'User' },
);
