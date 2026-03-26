/**
 * Centralised error handler middleware.
 * Must be registered as the last app.use() in app.js.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log the full error server-side for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl} — ${err.message}`);

  const statusCode = err.statusCode || err.status || 500;

  // In production, never leak internal error details
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred.'
      : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
