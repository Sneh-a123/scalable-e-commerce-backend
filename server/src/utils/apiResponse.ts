import { Response } from 'express';

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: Record<string, any>
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
      timestamp: new Date().toISOString()
    });
  }

  static error(
    res: Response,
    message: string = 'Internal server error',
    statusCode: number = 500,
    errors?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString()
    });
  }
}

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode: number = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
