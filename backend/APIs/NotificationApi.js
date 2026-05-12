import express from 'express';
import { NotificationModel } from '../Models/NotificationModel.js';

const notificationRouter = express.Router();

// Get all notifications for the current user
notificationRouter.get('/', async (req, res) => {
  try {
    const notifications = await NotificationModel.find({ recipient: req.user.userId })
      .populate('sender', 'name email profileImage')
      .populate('repository', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ message: 'Notifications retrieved', payload: notifications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', reason: err.message });
  }
});

// Get unread count
notificationRouter.get('/unread-count', async (req, res) => {
  try {
    const count = await NotificationModel.countDocuments({
      recipient: req.user.userId,
      read: false
    });
    res.json({ payload: count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching count', reason: err.message });
  }
});

// Mark all as read
notificationRouter.put('/read-all', async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notifications', reason: err.message });
  }
});

// Mark single notification as read
notificationRouter.put('/:id/read', async (req, res) => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', payload: notification });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification', reason: err.message });
  }
});

export default notificationRouter;
