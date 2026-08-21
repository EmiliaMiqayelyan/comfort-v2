import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface DownloadFileAttributes {
  id: string;
  filename: string;
  title: Record<string, string>;
  category: string | null;
  url: string;
  fileSize: string | null;
  downloadable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DownloadFile extends Model<DownloadFileAttributes> implements DownloadFileAttributes {
  declare id: string;
  declare filename: string;
  declare title: Record<string, string>;
  declare category: string | null;
  declare url: string;
  declare fileSize: string | null;
  declare downloadable: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

DownloadFile.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    filename: { type: DataTypes.STRING(255), allowNull: false },
    title: { type: DataTypes.JSON, allowNull: false },
    category: { type: DataTypes.STRING(80), allowNull: true },
    url: { type: DataTypes.STRING(500), allowNull: false },
    fileSize: { type: DataTypes.STRING(40), allowNull: true },
    downloadable: { type: DataTypes.TINYINT, defaultValue: 1 },
  },
  { sequelize, tableName: 'download_files', modelName: 'DownloadFile' },
);
