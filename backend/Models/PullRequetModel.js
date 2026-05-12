import { Schema, model } from 'mongoose';

const pullRequestSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Requester is required']
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Repository owner is required']
  },
  repository: {
    type: Schema.Types.ObjectId,
    ref: 'repository',
    required: [true, 'Repository is required']
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  versionKey: false
});

export const PullRequestModel = model('pullrequest', pullRequestSchema);
