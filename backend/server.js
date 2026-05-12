import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import { connect } from 'mongoose'
import { userRoute } from './APIs/UsersApi.js'
import { repositoryRoute } from './APIs/RepoApi.js'
import { authMiddleware } from './Middlewares/authMiddleware.js'
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
const mongoURL = process.env.MONGODB_URI || 'mongodb://localhost:27017/GitHub'

// Connect to MongoDB database
async function connectDB() {
  try {
    await connect(mongoURL)
    console.log('Connected to DB')
    app.listen(port, () => console.log(`server listening to port ${port}...`))
  } catch (err) {
    console.error('DB connection error:', err.message)
    process.exit(1)
  }
}

connectDB()

// CORS configuration for both development and production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://*.vercel.app', process.env.FRONTEND_URL] 
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,               // CRITICAL: Allows HttpOnly cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// use body parser middleware
app.use(express.json())
app.use(cookieParser())

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

// logout for user,author and admin(clear cookie)

//app.post('/logout', (req, res) => {
 // res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: true })// must match original cookie options
 // res.status(200).json({ message: 'Logout successful' })
//})


// dealing with invalid path 
app.use((req, res,next) => {
  //console.log(req)//however req is a very big object so we are logging it to see what it contains
console.log(req.url);// it will give us the path of the req which is being made to the server
  res.json({ message: `${req.url} is invalid`  }); // it has to be placed here becouse if we place it before the API routes 
})                   //then it will be executed for all the requests and we will get invalid path for all the requests

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'error', reason: err.message })
})
