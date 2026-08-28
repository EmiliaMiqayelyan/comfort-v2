import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { AppError } from '../../shared/errors/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path?.toString() ?? 'field';
    res.status(409).json({ error: `${field} already exists` });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(400).json({ error: 'Invalid reference' });
    return;
  }

  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Server error' });
}
