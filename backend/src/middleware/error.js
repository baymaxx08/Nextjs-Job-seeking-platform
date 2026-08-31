function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.originalUrl}`,
    errors: null,
  });
}

function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err.message || err);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // Handle PostgreSQL specific errors
  if (err.code === '23505') {
    // Unique violation
    statusCode = 409;
    if (err.detail && err.detail.includes('email')) {
      message = 'An account with this email already exists';
    } else {
      message = 'A duplicate record already exists';
    }
  } else if (err.code === '28P01' || err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error('[Database Connection Issue]:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    errors: err.errors || null,
  });
}

module.exports = {
  notFound,
  errorHandler,
};