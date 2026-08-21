import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface BlogPostAttributes {
  id: string;
  slug: string;
  title: Record<string, string>;
  excerpt: Record<string, string> | null;
  content: Record<string, string> | null;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  author: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BlogPost extends Model<BlogPostAttributes> implements BlogPostAttributes {
  declare id: string;
  declare slug: string;
  declare title: Record<string, string>;
  declare excerpt: Record<string, string> | null;
  declare content: Record<string, string> | null;
  declare coverImage: string | null;
  declare category: string | null;
  declare tags: string[];
  declare author: Record<string, unknown> | null;
  declare publishedAt: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BlogPost.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    title: { type: DataTypes.JSON, allowNull: false },
    excerpt: { type: DataTypes.JSON, allowNull: true },
    content: { type: DataTypes.JSON, allowNull: true },
    coverImage: { type: DataTypes.STRING(500), allowNull: true },
    category: { type: DataTypes.STRING(80), allowNull: true },
    tags: { type: DataTypes.JSON, defaultValue: [] },
    author: { type: DataTypes.JSON, allowNull: true },
    publishedAt: { type: DataTypes.DATEONLY, allowNull: true },
  },
  { sequelize, tableName: 'blog_posts', modelName: 'BlogPost' },
);
