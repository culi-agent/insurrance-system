import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        request_id: uuidv4(),
      },
    });
  }

  static created<T>(res: Response, data: T): Response {
    return ApiResponse.success(res, data, 201);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    perPage: number,
  ): Response {
    const totalPages = Math.ceil(total / perPage);
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: uuidv4(),
      },
    });
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode = 400,
    details?: Array<{ field: string; message: string; code: string }>,
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        request_id: uuidv4(),
      },
    });
  }
}
