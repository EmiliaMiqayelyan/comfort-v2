import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface MediaAssetAttributes {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'glb' | 'usdz' | 'texture';
  url: string;
  folder: string | null;
  size: number | null;
  createdAt?: Date;
}

export class MediaAsset extends Model<MediaAssetAttributes> implements MediaAssetAttributes {
  declare id: string;
  declare name: string;
  declare type: 'image' | 'video' | 'pdf' | 'glb' | 'usdz' | 'texture';
  declare url: string;
  declare folder: string | null;
  declare size: number | null;
  declare readonly createdAt: Date;
}

MediaAsset.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    type: {
      type: DataTypes.ENUM('image', 'video', 'pdf', 'glb', 'usdz', 'texture'),
      allowNull: false,
    },
    url: { type: DataTypes.STRING(500), allowNull: false },
    folder: { type: DataTypes.STRING(120), allowNull: true },
    size: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'media_assets', modelName: 'MediaAsset', updatedAt: false },
);
