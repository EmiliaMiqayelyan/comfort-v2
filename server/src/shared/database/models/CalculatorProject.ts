import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

export interface CalculatorProjectAttributes {
  id: string;
  userEmail: string | null;
  inputJson: Record<string, unknown>;
  resultJson: Record<string, unknown>;
  createdAt?: Date;
}

export class CalculatorProject extends Model<CalculatorProjectAttributes> implements CalculatorProjectAttributes {
  declare id: string;
  declare userEmail: string | null;
  declare inputJson: Record<string, unknown>;
  declare resultJson: Record<string, unknown>;
  declare readonly createdAt: Date;
}

CalculatorProject.init(
  {
    id: { type: DataTypes.CHAR(36), primaryKey: true },
    userEmail: { type: DataTypes.STRING(190), allowNull: true },
    inputJson: { type: DataTypes.JSON, allowNull: false },
    resultJson: { type: DataTypes.JSON, allowNull: false },
  },
  { sequelize, tableName: 'calculator_projects', modelName: 'CalculatorProject', updatedAt: false },
);
