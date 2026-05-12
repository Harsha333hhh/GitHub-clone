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
    enum: ['pull_request', 'pr_approved', 'pr_rejected', 'file_created', 'file_updated', 'file_deleted'],
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

export const NotificationModel = model('notification', notificationSchema);
