export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  res.status(statusCode).json({
    success: false,
    error: message,
    // Do not expose stack trace in production
    ...(process.env.NODE_ENV === 'development' && { details: err.stack })
  });
}
