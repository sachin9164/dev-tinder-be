const express = require('express');
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Allow frontend to call API with cookie-based auth
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Import routes
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const { sendError } = require('./utils/apiResponse');

// Define routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/request', requestRouter);
app.use('/api/user', userRouter);

// Handle 404 errors for undefined routes
app.use((req, res) => {
  return sendError(res, {
    statusCode: 404,
    message: 'Route not found',
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// Global error handling middleware
app.use((err, req, res) => {
  console.error(err);
  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error',
    errorCode: err.errorCode || 'INTERNAL_SERVER_ERROR',
  });
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the application if the database connection fails
  });
