const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return sendError(res, {
        statusCode: 401,
        message: 'Token is not valid.',
        errorCode: 'UNAUTHORIZED',
      });
    }
    const decoded = await jwt.verify(token, 'Shanth@1996');
    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return sendError(res, {
      statusCode: 401,
      message: 'Unauthorized',
      errorCode: 'UNAUTHORIZED',
    });
  }
};

module.exports = {
  userAuth,
};
