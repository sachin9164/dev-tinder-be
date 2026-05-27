const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/connectionRequest');
const requestRouter = require('./request');
const User = require('../models/user');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const userRouter = express.Router();

// GET - Get all pending requests for the logged-in user
userRouter.get('/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const pendingRequests = await ConnectionRequest.find({
      toUserID: loggedInUser._id,
      status: 'interested',
    }).populate('fromUserId', ['firstname', 'lastname', 'email', 'photoUrl']); // Populate the fromUserId field with user details

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Pending requests fetched successfully',
      data: pendingRequests,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'PENDING_REQUESTS_FETCH_FAILED',
    });
  }
});

// GET - Get all sent requests for the logged-in user
userRouter.get('/requests/connections', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const acceptedRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: 'accepted' },
        { toUserID: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', ['firstname', 'lastname', 'email', 'photoUrl'])
      .populate('toUserID', ['firstname', 'lastname', 'email', 'photoUrl']); // Populate the fromUserId and toUserID fields with user details

    const data = acceptedRequests.map((request) => {
      if (request.fromUserId._id.equals(loggedInUser._id)) {
        return request.toUserID;
      } else {
        return request.fromUserId;
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Connections fetched successfully',
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'CONNECTIONS_FETCH_FAILED',
    });
  }
});

// GET - Get feed for the logged-in user
userRouter.get('/feed', userAuth, async (req, res) => {
  console.log('Fetching feed for user:', req.user._id); // Debug log to check user ID
  try {
    const loggedInUser = req.user;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const safeLimit = Math.min(limit, 50);

    if (page < 1 || safeLimit < 1) {
      return sendError(res, {
        statusCode: 400,
        message: 'page and limit must be positive numbers',
        errorCode: 'INVALID_PAGINATION',
      });
    }

    const skip = (page - 1) * safeLimit;

    // donot want - 1. his own profile
    // 2. users who have sent him a request (ignored/interested)
    // 3. users to whom he has sent a request (ignored/interested)

    const sentRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status: { $in: ['ignored', 'interested'] },
    }).select('toUserID fromUserId');

    const receivedRequests = await ConnectionRequest.find({
      toUserID: loggedInUser._id,
      status: { $in: ['ignored', 'interested'] },
    })
      .select('fromUserId toUserID')
      .populate('fromUserId', 'firstname lastname email photoUrl'); // Populate the fromUserId field with user details

    const excludedUserIds = [
      loggedInUser._id,
      ...sentRequests.map((req) => req.toUserID),
      ...receivedRequests.map((req) => req.fromUserId),
    ];

    const feedFilter = {
      _id: { $nin: excludedUserIds },
    };

    const [totalUsers, feedUsers] = await Promise.all([
      User.countDocuments(feedFilter),
      User.find(feedFilter)
        .select('firstname lastname email photoUrl about skills')
        .skip(skip)
        .limit(safeLimit),
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Feed fetched successfully',
      data: feedUsers,
      meta: {
        total: totalUsers,
        page,
        limit: safeLimit,
        hasNextPage: skip + feedUsers.length < totalUsers,
      },
    });
  } catch (err) {
    console.error('Error fetching feed:', err);
    return sendError(res, {
      statusCode: 400,
      message: err.message,
      errorCode: 'FEED_FETCH_FAILED',
    });
  }
});

module.exports = userRouter;
