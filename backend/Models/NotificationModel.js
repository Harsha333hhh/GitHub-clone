import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  type: {
    type: String,
    enum: [
      'pull_request', 
      'pr_approved', 
      'pr_rejected', 
      'pr_created',
      'file_created', 
      'file_updated', 
      'file_deleted',
      'collaborator_added',
      'repository_visibility_changed',
      'ownership_transferred'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  repository: {
    type: Schema.Types.ObjectId,
    ref: 'repository'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Add indexes for query performance
notificationSchema.index({ recipient: 1 });  // Fast lookups by recipient
notificationSchema.index({ read: 1 });  // Fast filtering by read status
notificationSchema.index({ recipient: 1, read: 1 });  // Compound index for unread notifications
notificationSchema.index({ createdAt: -1 });  // Sorting by creation date

export const NotificationModel = model('notification', notificationSchema);
