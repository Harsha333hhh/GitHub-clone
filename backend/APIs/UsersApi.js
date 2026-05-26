import express from 'express'
import { register } from '../Controllers/userController.js'
import { authenticate } from '../services/authservices.js'
import { RepositoryModel } from '../Models/RepositoryModel.js'
import { UserModel } from '../Models/UserModel.js';
import { verifyToken } from '../Middlewares/verifyToken.js'
import { authMiddleware } from '../Middlewares/authMiddleware.js'
import bcrypt from 'bcrypt';

export const userRoute = express.Router()

// POST /api/users - User Registration endpoint
// Creates a new user account with hashed password (bcrypt: secure password hashing algorithm)
// Returns 201 status on success with user data (password excluded for security)
userRoute.post('/users', async (req, res, next) => {
  try {
    console.log('Signup request received:', req.body);
    const userData = await register({ ...req.body })
    res.status(201).json({ message: 'User registered successfully', user: userData })
  } catch (err) {
    console.error('Signup error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Registration failed', error: err.toString() })
  }
})

// POST /api/login - User Login endpoint
// Verifies email/password using bcrypt.compare() (compares plain text password with hashed stored password)
// Generates JWT token (signed token containing userId, expires in 24 hours) stored in HTTP-only cookie
// httpOnly=true prevents JavaScript from accessing token (XSS protection), sameSite=lax prevents CSRF attacks
userRoute.post('/login', async (req, res, next) => {

  let userCred = req.body

  let { token, user } = await authenticate(userCred)

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === 'production' || process.env.RENDER === 'true', // Use secure in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })

  res.status(200).json({
    message: "Login successful",
    token,
    user
  })
})
// POST /api/logout - User Logout endpoint
// Requires valid JWT token (authMiddleware validates token before allowing request)
// Clears the authentication cookie to end user session
userRoute.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false })// must match original cookie options
  res.status(200).json({ message: 'Logout successful' })
})

// PUT /api/users - Update User Profile endpoint
// Requires valid JWT token (authMiddleware: verifies token and extracts userId from decoded JWT)
// bcrypt.genSalt(10): generates random salt (2^10 iterations) for secure password hashing
// Updates user profile fields and hashes new password if provided
userRoute.put('/users', authMiddleware, async (req, res, next) => {
  try {
    let userId = req.user.userId;
    let updateData = req.body;
    // if password is being updated then hash the new password
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    let updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    res.status(200).json({ message: "User details updated successfully", user: updatedUser })
  } catch (err) {
    next(err)
  }
})

// GET /api/users/:username - Retrieve User Profile endpoint
// Public endpoint (no authentication required) - retrieves user profile by username
// Uses .select('-password') to exclude password from response (security)
// Uses .populate('repositories') to fetch associated repository documents from database
userRoute.get('/users/:username', async (req, res, next) => {
  try {
    const username = req.params.username;
    // Try exact match first, then case-insensitive search
    let user = await UserModel.findOne({ name: username })
      .select('-password')
      .populate('repositories');
    
    if (!user) {
      // Try case-insensitive search
      user = await UserModel.findOne({ name: { $regex: `^${username}$`, $options: 'i' } })
        .select('-password')
        .populate('repositories');
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User found', payload: user });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload-profile-picture - Upload Profile Avatar endpoint
// Requires valid JWT token (authMiddleware verifies user identity)
// Accepts base64 encoded image data (encoded image sent as string in request body)
// Validates image format and size (max 2MB) before storing to prevent malicious uploads
userRoute.post('/upload-profile-picture', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    // Validate it's a base64 image
    if (!profileImage.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Please upload a valid image.' });
    }

    // Optional: Check file size (limit to 2MB)
    const base64Data = profileImage.split(',')[1];
    const fileSizeInBytes = Buffer.byteLength(base64Data, 'base64');
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (fileSizeInMB > 2) {
      return res.status(400).json({ message: 'Image size must be less than 2MB' });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select('-password');

    res.status(200).json({ 
      message: 'Profile picture updated successfully', 
      user: updatedUser 
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/delete - Permanently Delete User Account endpoint
// Requires valid JWT token (authMiddleware verifies user has valid authentication)
// Removes user document from MongoDB database and clears authentication cookie
// User data cannot be recovered after deletion (permanent removal)
userRoute.delete('/delete', authMiddleware, async (req, res, next) => {
  try {
    let userId = req.user.userId;
    await UserModel.findByIdAndDelete(userId);
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false })// clear cookie on account deletion
    res.status(200).json({ message: "User account deleted successfully" })
  } catch (err) {
    next(err) 
  }
})