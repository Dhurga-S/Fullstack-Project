/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode;
  if (!statusCode || statusCode === 200) {
    statusCode = 500;
  }

  let message = err.message || 'Internal server error';

  // Handle Mongoose CastError (e.g. malformed ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'ID'} format`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Log unexpected internal server errors on server side for debugging
  if (statusCode === 500) {
    console.error('[ServerError]', err);
  }

  const response = {
    success: false,
    message
  };

  if (err.status) {
    response.status = err.status;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  errorHandler
};
