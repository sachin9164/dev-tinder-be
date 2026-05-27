const express = require('express');
const { validateSingUpData } = require('./../utils/validation');
const bcrypt = require('bcrypt');
const User = require('./../models/user');
const { userAuth } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // 1 validation of data
    validateSingUpData(req);

    // 2 encryption of password3 save to database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.body.password = hashedPassword;
    const user = new User({
      firstName,
      lastName,
      email,
      password: req.body.password,
    });
    await user.save();
    return sendSuccess(res, {
      statusCode: 201,
      message: 'User created successfully',
    });
  } catch (err) {
    console.error(err.message);
    return sendError(res, {
      statusCode: 500,
      message: err.message,
      errorCode: 'SIGNUP_FAILED',
    });
  }
});

// POST /login - user login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid Credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      // 1 generate JWT token

      const token = await user.getJWT();
      // 2 send token to with cookie
      res.cookie(
        'token',
        token,
        { httpOnly: true },
        { expires: new Date(Date.now() + 1 * 3600000) }
      );
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Login successful',
      });
    } else {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid Credentials',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }
  } catch (err) {
    console.error(err.message);
    return sendError(res, {
      statusCode: 500,
      message: err.message,
      errorCode: 'LOGIN_FAILED',
    });
  }
});

authRouter.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token');
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logout successful',
    });
  } catch (err) {
    console.error(err.message);
    return sendError(res, {
      statusCode: 500,
      message: err.message,
      errorCode: 'LOGOUT_FAILED',
    });
  }
});

authRouter.patch('/updatepassword', userAuth, async (req, res) => {
  try {
    const updatedPassword = req.body.password;
    const loggedInUser = req.user;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(updatedPassword, saltRounds);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Password update successfully',
      data: loggedInUser,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'PASSWORD_UPDATE_FAILED',
    });
  }
});

module.exports = authRouter;
