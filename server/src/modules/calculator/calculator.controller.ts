import { Request, Response } from 'express';
import { createCalculatorDto } from './calculator.dto';
import { calculatorService } from './calculator.service';

export class CalculatorController {
  async create(req: Request, res: Response) {
    const data = createCalculatorDto.parse(req.body);
    res.status(201).json(await calculatorService.create(data as unknown as Record<string, unknown>));
  }
}

export const calculatorController = new CalculatorController();
