import { Router } from 'express';
import { calculatorController } from './calculator.controller';

const router = Router();

router.post('/', (req, res) => calculatorController.create(req, res));

export { router as calculatorRoutes };
