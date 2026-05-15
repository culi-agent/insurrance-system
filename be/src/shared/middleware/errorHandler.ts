import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
    });
    ApiResponse.error(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Unexpected errors
  logger.error('Unexpected error:', { error: err.message, stack: err.stack });
  ApiResponse.error(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    500,
  );
}
