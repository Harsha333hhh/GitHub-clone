import { Schema, model } from 'mongoose';

const pullRequestSchema = new Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    default: ''
  },
  
  // Users
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Author is required']
  },
  repository: {
    type: Schema.Types.ObjectId,
    ref: 'repository',
    required: [true, 'Repository is required']
  },
  
  // Changes (for code PRs)
  changes: [{
    fileName: String,
    status: { type: String, enum: ['added', 'modified', 'deleted'], default: 'modified' },
    oldContent: String,
    newContent: String,
    additions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 }
  }],
  
  // Status & State
  status: {
    type: String,
    enum: ['open', 'closed', 'merged'],
    default: 'open'
  },
  
  // Collaborator access request (legacy support)
  requestingAccess: {
    type: Boolean,
    default: false
  },
  
  // Reviews & Comments
  reviews: [{
    reviewer: { type: Schema.Types.ObjectId, ref: 'user' },
    decision: { type: String, enum: ['approved', 'changes_requested', 'commented'], default: 'commented' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  comments: [{
    author: { type: Schema.Types.ObjectId, ref: 'user' },
    content: String,
    fileIndex: Number, // for line-specific comments
    lineNumber: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  
  // Merge info
  mergedAt: Date,
  mergedBy: { type: Schema.Types.ObjectId, ref: 'user' },
  closedAt: Date,
  closedBy: { type: Schema.Types.ObjectId, ref: 'user' },
  
  // Legacy fields for backward compatibility
  from: { type: Schema.Types.ObjectId, ref: 'user' },
  to: { type: Schema.Types.ObjectId, ref: 'user' },
  message: { type: String, default: '' }
}, {
  timestamps: true,
  versionKey: false
});

// Add indexes for query performance
pullRequestSchema.index({ repository: 1 });  // Fast lookups by repository
pullRequestSchema.index({ author: 1 });  // Fast lookups by author
pullRequestSchema.index({ status: 1 });  // Fast filtering by status
pullRequestSchema.index({ repository: 1, status: 1 });  // Compound index for common queries
pullRequestSchema.index({ createdAt: -1 });  // Sorting by creation date

export const PullRequestModel = model('pullrequest', pullRequestSchema);
