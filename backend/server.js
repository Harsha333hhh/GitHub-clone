import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import { connect } from 'mongoose'
import { userRoute } from './APIs/UsersApi.js'
import { repositoryRoute } from './APIs/RepoApi.js'
import { authMiddleware } from './Middlewares/authMiddleware.js'
import { errorHandler } from './Middlewares/errorHandler.js'
import { commonRouter } from './APIs/CommonApi.js'
import filerouter from './APIs/FileApi.js'
import commitRouter from './APIs/CommitApi.js'
import issueRouter from './APIs/IssuesApi.js'
import pullRequestRouter from './APIs/PullRequest.js'
import notificationRouter from './APIs/NotificationApi.js'
import cors from 'cors'
dotenv.config()

// create http server
const app = express()
const port = process.env.PORT || 4000
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/GitHub'
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

// Connect to MongoDB database
async function connectDB() {
  try {
    await connect(mongodbUri)
    console.log('Connected to DB')
    app.listen(port, () => console.log(`server listening to port ${port}...`))
  } catch (err) {
    console.error('DB connection error:', err.message)
    process.exit(1)
  }
}

connectDB()

// CORS configuration that accepts both production and preview Vercel URLs
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      frontendUrl,
      'http://localhost:5173',
      'http://localhost:5174',
      'https://git-hub-clone-lime.vercel.app', // production custom domain
    ];
    
    // Allow any vercel.app preview URL
    if (origin && origin.includes('.vercel.app')) {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))

// use body parser middleware
app.use(express.json())
app.use(cookieParser())

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'GitHub Clone API is running', status: 'OK' })
})

// Middleware to apply auth only to write operations (POST, PUT, DELETE)
// Reads cookies from frontend automatically, no bearer token needed
const authForWriteOps = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
};

// forward req to specific APIs
app.use('/user-api', userRoute)
app.use('/repository-api', authForWriteOps, repositoryRoute);
app.use('/common-api', commonRouter);
app.use('/file-api', filerouter);
app.use('/commit-api', commitRouter);
app.use('/issue-api', issueRouter);
app.use('/pullrequest-api', authMiddleware, pullRequestRouter);
app.use('/notification-api', authMiddleware, notificationRouter);

// Centralized error handling middleware (MUST be last route handler)
app.use(errorHandler);

// 404 handler (AFTER error handler)
app.use((req, res) => {
  console.log('Invalid path:', req.url);
  res.status(404).json({ message: `${req.url} is invalid`  });
})
