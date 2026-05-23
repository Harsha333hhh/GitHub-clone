import express from 'express'
import { register } from '../Controllers/userController.js'
import { authenticate } from '../services/authservices.js'
import { RepositoryModel } from '../Models/RepositoryModel.js'
import { UserModel } from '../Models/UserModel.js';
import { verifyToken } from '../Middlewares/verifyToken.js'
import { authMiddleware } from '../Middlewares/authMiddleware.js'
import bcrypt from 'bcrypt';

export const userRoute = express.Router()

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

//authenticate user 
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
// logout user
userRoute.post('/logout', authMiddleware, (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false })// must match original cookie options
  res.status(200).json({ message: 'Logout successful' })
})

//update user details
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

// get user by username
userRoute.get('/users/:username', async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await UserModel.findOne({ name: username })
      .select('-password')
      .populate('repositories');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User found', payload: user });
  } catch (err) {
    next(err);
  }
});

// delete user
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