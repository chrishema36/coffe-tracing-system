import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * AppError — typed application error with HTTP status code.
 * Use this for expected business-logic failures (404, 400, 409, etc.)
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain for instanceof checks across transpile boundaries
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Central error handling middleware.
 * Handles: AppError, ZodError (validation), Prisma errors, and unknown errors.
 * Never leaks internal stack traces or raw error messages in production.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const timestamp = new Date().toISOString();

  // 1. Known business-logic errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      timestamp,
    });
    return;
  }

  // 2. Zod validation errors — expose field-level detail safely
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your request body.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      timestamp,
    });
    return;
  }

  // 3. Prisma unique constraint violation (e.g. duplicate bagCode / farmerCode)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists.`,
        timestamp,
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'The requested record was not found.',
        timestamp,
      });
      return;
    }
  }

  // 4. Unknown / unhandled errors — log internally but never expose in production
  const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
  console.error('💥 Unhandled Exception:', err);

  res.status(500).json({
    success: false,
    message: IS_PRODUCTION ? 'Internal Server Error' : errorMessage,
    timestamp,
  });
};
