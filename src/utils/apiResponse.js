const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request successful',
    data = null,
    meta = null,
  } = {}
) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (
  res,
  {
    statusCode = 500,
    message = 'Something went wrong',
    errorCode = 'INTERNAL_SERVER_ERROR',
    details = null,
  } = {}
) => {
  const payload = {
    success: false,
    message,
    error: {
      code: errorCode,
    },
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
