import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CertificateAttributes {
  id: string;
  title: Record<string, string>;
  issuer: string | null;
  year: number | null;
  fileUrl: string | null;
  image: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Certificate extends Model<CertificateAttributes> implements CertificateAttributes {
  declare id: string;
  declare title: Record<string, string>;
  declare issuer: string | null;
  declare year: number | null;
  declare fileUrl: string | null;
  declare image: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Certificate.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    title: { type: DataTypes.JSON, allowNull: false },
    issuer: { type: DataTypes.STRING(160), allowNull: true },
    year: { type: DataTypes.SMALLINT, allowNull: true },
    fileUrl: { type: DataTypes.STRING(500), allowNull: true },
    image: { type: DataTypes.STRING(500), allowNull: true },
  },
  { sequelize, tableName: 'certificates', modelName: 'Certificate' },
);
