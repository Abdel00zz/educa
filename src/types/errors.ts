export interface DatabaseError {
  code: 'DB_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND';
  message: string;
  timestamp: string;
  details?: unknown;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}