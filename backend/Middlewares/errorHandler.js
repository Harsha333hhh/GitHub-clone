// CENTRALIZED ERROR HANDLING MIDDLEWARE
// Provides consistent error responses across all API endpoints
// Handles different error types: validation errors, auth errors, server errors

export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  let errorType = err.errorType || 'SERVER_ERROR';

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'VALIDATION_ERROR';
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    errorType = 'DUPLICATE_ERROR';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Handle MongoDB cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorType = 'INVALID_ID_ERROR';
    message = 'Invalid ID format';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'INVALID_TOKEN_ERROR';
    message = 'Invalid token';
  }

  // Handle JWT expiration
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'TOKEN_EXPIRED_ERROR';
    message = 'Token has expired';
  }

  // Log error for debugging (in production, use proper logging service)
  console.error(`[${errorType}] ${message}`, {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    error: err.stack
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    errorType,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, errorType = 'API_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Error.captureStackTrace(this, this.constructor);
  }
}
