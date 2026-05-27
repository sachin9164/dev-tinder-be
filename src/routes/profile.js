const express = require('express');
const { userAuth } = require('../middleware/auth');
const { validateProfileData } = require('../utils/validation');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const profileRouter = express.Router();

profileRouter.get('/view', userAuth, async (req, res) => {
  try {
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile fetched successfully',
      data: req.user,
    });
  } catch (err) {
    console.error(err.message);
    return sendError(res, {
      statusCode: 500,
      message: err.message,
      errorCode: 'PROFILE_FETCH_FAILED',
    });
  }
});

profileRouter.patch('/edit', userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error('Invalid Edit Request');
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      return (loggedInUser[key] = req.body[key]);
    });

    await loggedInUser.save();
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile update successfully',
      data: loggedInUser,
    });
  } catch (err) {
    //console.log(err);
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'PROFILE_UPDATE_FAILED',
    });
  }
});
module.exports = profileRouter;
