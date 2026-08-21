import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface ContactMessageAttributes {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  createdAt?: Date;
}

export class ContactMessage extends Model<ContactMessageAttributes> implements ContactMessageAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare phone: string | null;
  declare company: string | null;
  declare message: string;
  declare readonly createdAt: Date;
}

ContactMessage.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    name: { type: DataTypes.STRING(160), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false },
    phone: { type: DataTypes.STRING(40), allowNull: true },
    company: { type: DataTypes.STRING(160), allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, tableName: 'contact_messages', modelName: 'ContactMessage', updatedAt: false },
);
