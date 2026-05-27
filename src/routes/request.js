const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const requestRouter = express.Router();

requestRouter.post('/send/:status/:toUserId', userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const allowedStatus = ['ignored', 'interested'];

    if (!allowedStatus.includes(req.params.status)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Not a valid status type',
        errorCode: 'INVALID_STATUS',
      });
    }

    // Validate toUserId before querying
    if (!mongoose.Types.ObjectId.isValid(req.params.toUserId)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid To User ID format',
        errorCode: 'INVALID_USER_ID',
      });
    }

    const toUser = await User.findById(req.params.toUserId);

    if (!toUser) {
      return sendError(res, {
        statusCode: 404,
        message: 'User Not Found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: loggedInUser._id, toUserID: req.params.toUserId },
        { fromUserId: req.params.toUserId, toUserID: loggedInUser._id },
      ],
    });

    if (existingConnectionRequest) {
      return sendError(res, {
        statusCode: 400,
        message: 'Connection Request already exists',
        errorCode: 'REQUEST_ALREADY_EXISTS',
      });
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId: loggedInUser._id,
      toUserID: req.params.toUserId,
      status: req.params.status,
    });
    await connectionRequest.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: `${req.user.firstname} ${req.params.status} to ${req.params.toUserId}`,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'SEND_REQUEST_FAILED',
    });
  }
});

requestRouter.post('/review/:status/:requestId', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowedStatus = ['accepted', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Status not allowed',
        errorCode: 'INVALID_STATUS',
      });
    }

    // Validate requestId before querying
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return sendError(res, {
        statusCode: 400,
        message: 'Invalid request ID format',
        errorCode: 'INVALID_REQUEST_ID',
      });
    }

    const existingConnectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserID: loggedInUser._id,
      status: 'interested',
    });

    if (!existingConnectionRequest) {
      return sendError(res, {
        statusCode: 404,
        message: 'Connection request not found',
        errorCode: 'REQUEST_NOT_FOUND',
      });
    }

    const connectionRequest = await ConnectionRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Connection request ${status} successfully`,
      data: connectionRequest,
    });
  } catch (error) {
    console.error('Error reviewing connection request:', error);
    return sendError(res, {
      statusCode: 400,
      message: error.message,
      errorCode: 'REVIEW_REQUEST_FAILED',
    });
  }
});

module.exports = requestRouter;
