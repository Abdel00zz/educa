import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      details: err.details
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: err.message
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      error: err.message
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: err.message
    });
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
};

export class ValidationError extends Error {
  details: any;
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
