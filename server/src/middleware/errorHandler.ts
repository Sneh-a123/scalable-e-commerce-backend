import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  logger.error(`[Error] ${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    name: err.name
  });

  // Handle AppError
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    return ApiResponse.error(res, message, 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e: any) => ({
      field: e.path,
      message: e.message
    }));
    return ApiResponse.error(res, 'Validation error', 422, errors);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid format for field '${err.path}'`, 400);
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && 'body' in err) {
    return ApiResponse.error(res, 'Invalid JSON syntax in request body', 400);
  }

  // General internal server error
  const message = ENV.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';
  return ApiResponse.error(
    res,
    message,
    err.status || 500,
    ENV.NODE_ENV !== 'production' ? { stack: err.stack } : undefined
  );
};
