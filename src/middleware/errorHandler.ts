import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      obj: {
        error: err.message,
        code: err.code,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    obj: { error: 'Internal server error', code: 'INTERNAL_ERROR' },
  });
}
