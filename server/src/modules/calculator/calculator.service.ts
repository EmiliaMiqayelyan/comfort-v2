import { CalculatorProject } from '../../shared/database/models';
import { generateId } from '../../shared/utils/uuid';

export class CalculatorService {
  async create(data: Record<string, unknown>) {
    const id = generateId();
    return CalculatorProject.create({ id, ...data } as CalculatorProject['_creationAttributes']);
  }
}

export const calculatorService = new CalculatorService();
