const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },

    toUserID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: '{VALUE} is not supported',
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre('save', function () {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserID)) {
    throw new Error('Cannot Send connection request to yourself');
  }
});

connectionRequestSchema.index({ fromUserId: 1, toUserID: 1 });
//
const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
  'connectionRequestSchema'
);
module.exports = ConnectionRequest;
