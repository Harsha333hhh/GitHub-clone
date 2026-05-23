import express from 'express';
import { PullRequestModel } from '../Models/PullRequetModel.js';
import { RepositoryModel } from '../Models/RepositoryModel.js';
import { fileModel } from '../Models/FileModel.js';
import { NotificationModel } from '../Models/NotificationModel.js';
import { authMiddleware } from '../Middlewares/authMiddleware.js';

const pullRequestRouter = express.Router();

// ===== NEW: Create a pull request with code changes =====
pullRequestRouter.post('/repo/:repoId/create', authMiddleware, async (req, res) => {
  try {
    const { title, description, changes } = req.body;
    const repoId = req.params.repoId;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const repo = await RepositoryModel.findById(repoId);
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Check write access
    const isOwner = repo.owner.toString() === userId;
    const isCollaborator = repo.collaborators && repo.collaborators.some(c => c.toString() === userId);
    const hasAccess = isOwner || isCollaborator;

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this repository' });
    }

    const pr = new PullRequestModel({
      title,
      description: description || '',
      author: userId,
      repository: repoId,
      changes: changes || [],
      status: 'open'
    });

    await pr.save();

    // Notify repo owner if not author
    if (!isOwner) {
      const notification = new NotificationModel({
        recipient: repo.owner,
        sender: userId,
        type: 'pr_created',
        message: `created a pull request "${title}" in ${repo.title}`,
        repository: repoId
      });
      await notification.save();
    }

    await pr.populate('author', 'name email profileImage');
    await pr.populate('repository', 'title owner');

    res.status(201).json({ message: 'Pull request created', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error creating pull request', reason: err.message });
  }
});

// ===== Get PRs for a repository =====
pullRequestRouter.get('/repo/:repoId/list', async (req, res) => {
  try {
    const { status } = req.query; // 'open', 'closed', 'merged'
    const repoId = req.params.repoId;

    let query = { repository: repoId };
    if (status) query.status = status;

    const prs = await PullRequestModel.find(query)
      .populate('author', 'name email profileImage')
      .populate('repository', 'title')
      .sort({ createdAt: -1 });

    res.json({ message: 'Pull requests retrieved', payload: prs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull requests', reason: err.message });
  }
});

// ===== LEGACY: Get PRs sent by current user =====
pullRequestRouter.get('/sent', authMiddleware, async (req, res) => {
  try {
    const prs = await PullRequestModel.find({ 
      $or: [
        { author: req.user.userId },
        { from: req.user.userId }
      ]
    })
      .populate([
        { path: 'author', select: 'name email profileImage' },
        { path: 'from', select: 'name email profileImage' },
        { path: 'to', select: 'name email profileImage' },
        { path: 'repository', select: 'title' }
      ])
      .sort({ createdAt: -1 });

    res.json({ message: 'Sent pull requests', payload: prs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull requests', reason: err.message });
  }
});

// ===== LEGACY: Get PRs received by current user =====
pullRequestRouter.get('/received', authMiddleware, async (req, res) => {
  try {
    // First, find all repositories owned by the user
    const userRepositories = await RepositoryModel.find({ owner: req.user.userId }).select('_id');
    const repoIds = userRepositories.map(r => r._id);

    // Get PRs where user is the recipient (to field) OR where the PR is for a repo they own
    const prs = await PullRequestModel.find({
      $or: [
        { to: req.user.userId },
        { repository: { $in: repoIds } }
      ]
    })
      .populate([
        { path: 'author', select: 'name email profileImage' },
        { path: 'from', select: 'name email profileImage' },
        { path: 'to', select: 'name email profileImage' },
        { path: 'repository', select: 'title owner' }
      ])
      .sort({ createdAt: -1 });

    res.json({ message: 'Received pull requests', payload: prs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull requests', reason: err.message });
  }
});

// ===== Add comment to PR =====
pullRequestRouter.post('/:prId/comments', authMiddleware, async (req, res) => {
  try {
    const { content, lineNumber, fileIndex } = req.body;
    const prId = req.params.prId;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const pr = await PullRequestModel.findById(prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    pr.comments.push({
      author: userId,
      content,
      lineNumber: lineNumber || null,
      fileIndex: fileIndex || null
    });

    await pr.save();

    await pr.populate('comments.author', 'name email profileImage');
    
    // Notify PR author
    if (pr.author.toString() !== userId) {
      const notification = new NotificationModel({
        recipient: pr.author,
        sender: userId,
        type: 'pr_comment',
        message: `commented on your pull request`,
        repository: pr.repository
      });
      await notification.save();
    }

    res.json({ message: 'Comment added', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', reason: err.message });
  }
});

// ===== Review PR (approve/request changes/comment) =====
pullRequestRouter.post('/:prId/review', authMiddleware, async (req, res) => {
  try {
    const { decision, comment } = req.body; // 'approved', 'changes_requested', 'commented'
    const prId = req.params.prId;
    const userId = req.user.userId;

    if (!['approved', 'changes_requested', 'commented'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const pr = await PullRequestModel.findById(prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    const repo = await RepositoryModel.findById(pr.repository);
    
    // Only owner can formally approve
    if (decision === 'approved' && repo.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the repository owner can approve PRs' });
    }

    // Check if user already reviewed
    const existingReview = pr.reviews.find(r => r.reviewer.toString() === userId);
    if (existingReview) {
      existingReview.decision = decision;
      existingReview.comment = comment || '';
      existingReview.createdAt = new Date();
    } else {
      pr.reviews.push({
        reviewer: userId,
        decision,
        comment: comment || ''
      });
    }

    await pr.save();

    await pr.populate('reviews.reviewer', 'name email profileImage');

    // Notify PR author
    if (pr.author.toString() !== userId) {
      const notifMsg = decision === 'approved' ? 'approved your pull request' :
                       decision === 'changes_requested' ? 'requested changes in your pull request' :
                       'reviewed your pull request';
      const notification = new NotificationModel({
        recipient: pr.author,
        sender: userId,
        type: 'pr_review',
        message: notifMsg,
        repository: pr.repository
      });
      await notification.save();
    }

    res.json({ message: 'Review added', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error adding review', reason: err.message });
  }
});

// ===== Merge PR (apply changes to main files) =====
pullRequestRouter.post('/:prId/merge', authMiddleware, async (req, res) => {
  try {
    const prId = req.params.prId;
    const userId = req.user.userId;

    const pr = await PullRequestModel.findById(prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({ message: `Cannot merge a ${pr.status} pull request` });
    }

    const repo = await RepositoryModel.findById(pr.repository);
    
    // Only owner can merge
    if (repo.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the repository owner can merge PRs' });
    }

    // Apply changes to files
    if (pr.changes && pr.changes.length > 0) {
      for (const change of pr.changes) {
        if (change.status === 'added' || change.status === 'modified') {
          // Update or create file
          await fileModel.updateOne(
            { repoId: pr.repository, fileName: change.fileName },
            {
              repoId: pr.repository,
              fileName: change.fileName,
              path: `/${change.fileName}`,
              content: change.newContent,
              size: `${Buffer.byteLength(change.newContent)}`,
            },
            { upsert: true }
          );
        } else if (change.status === 'deleted') {
          // Delete file
          await fileModel.deleteOne({
            repoId: pr.repository,
            fileName: change.fileName
          });
        }
      }
    }

    // Update PR status
    pr.status = 'merged';
    pr.mergedAt = new Date();
    pr.mergedBy = userId;
    await pr.save();

    // Notify PR author
    if (pr.author.toString() !== userId) {
      const notification = new NotificationModel({
        recipient: pr.author,
        sender: userId,
        type: 'pr_merged',
        message: `merged your pull request`,
        repository: pr.repository
      });
      await notification.save();
    }

    await pr.populate('author', 'name email profileImage');
    await pr.populate('mergedBy', 'name email profileImage');
    await pr.populate('repository', 'title');

    res.json({ message: 'Pull request merged successfully', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error merging pull request', reason: err.message });
  }
});

// ===== Close PR (without merging) =====
pullRequestRouter.post('/:prId/close', authMiddleware, async (req, res) => {
  try {
    const prId = req.params.prId;
    const userId = req.user.userId;

    const pr = await PullRequestModel.findById(prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    if (pr.status !== 'open') {
      return res.status(400).json({ message: `Pull request is already ${pr.status}` });
    }

    const repo = await RepositoryModel.findById(pr.repository);
    
    // Author or owner can close
    if (pr.author.toString() !== userId && repo.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the PR author or repo owner can close' });
    }

    pr.status = 'closed';
    pr.closedAt = new Date();
    pr.closedBy = userId;
    await pr.save();

    await pr.populate('author', 'name email profileImage');
    await pr.populate('closedBy', 'name email profileImage');
    await pr.populate('repository', 'title');

    res.json({ message: 'Pull request closed', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error closing pull request', reason: err.message });
  }
});

// ===== LEGACY: Create a pull request (request access to a repo) =====
pullRequestRouter.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { repository, message } = req.body;

    if (!repository) {
      return res.status(400).json({ message: 'Repository ID is required' });
    }

    const repo = await RepositoryModel.findById(repository).populate('owner', 'name');
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    if (repo.owner._id.toString() === userId) {
      return res.status(400).json({ message: 'You already own this repository' });
    }

    if (repo.collaborators && repo.collaborators.map(c => c.toString()).includes(userId)) {
      return res.status(400).json({ message: 'You already have access to this repository' });
    }

    const existing = await PullRequestModel.findOne({
      author: userId,
      repository,
      status: 'open',
      requestingAccess: true
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this repository' });
    }

    const pr = new PullRequestModel({
      title: `Access Request to ${repo.title}`,
      description: message || '',
      author: userId,
      from: userId,
      to: repo.owner._id,
      repository,
      message: message || `Requesting access to ${repo.title}`,
      requestingAccess: true
    });
    await pr.save();

    const notification = new NotificationModel({
      recipient: repo.owner._id,
      sender: userId,
      type: 'pull_request',
      message: `requested access to ${repo.title}`,
      repository
    });
    await notification.save();

    await pr.populate([
      { path: 'author', select: 'name email profileImage' },
      { path: 'from', select: 'name email profileImage' },
      { path: 'to', select: 'name email profileImage' },
      { path: 'repository', select: 'title' }
    ]);

    res.status(201).json({ message: 'Pull request created', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error creating pull request', reason: err.message });
  }
});

// ===== Get PR details =====
pullRequestRouter.get('/:prId', async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId)
      .populate('author', 'name email profileImage')
      .populate('repository', 'title owner')
      .populate('reviews.reviewer', 'name email profileImage')
      .populate('comments.author', 'name email profileImage')
      .populate('mergedBy', 'name email profileImage')
      .populate('closedBy', 'name email profileImage');

    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    res.json({ message: 'Pull request retrieved', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull request', reason: err.message });
  }
});

// ===== LEGACY: Approve PR =====
pullRequestRouter.put('/:prId/approve', authMiddleware, async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    if (pr.to.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the repository owner can approve' });
    }

    if (pr.status !== 'open' && pr.requestingAccess) {
      return res.status(400).json({ message: `Pull request is already approved/rejected` });
    }

    pr.status = 'approved';
    await pr.save();

    await RepositoryModel.findByIdAndUpdate(pr.repository, {
      $addToSet: { collaborators: pr.from }
    });

    const repo = await RepositoryModel.findById(pr.repository);
    const notification = new NotificationModel({
      recipient: pr.from,
      sender: req.user.userId,
      type: 'pr_approved',
      message: `approved your access request to ${repo?.title || 'a repository'}`,
      repository: pr.repository
    });
    await notification.save();

    await pr.populate([
      { path: 'from', select: 'name email profileImage' },
      { path: 'to', select: 'name email profileImage' },
      { path: 'repository', select: 'title' }
    ]);

    res.json({ message: 'Pull request approved', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error approving pull request', reason: err.message });
  }
});

// ===== LEGACY: Reject PR =====
pullRequestRouter.put('/:prId/reject', authMiddleware, async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    if (pr.to.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the repository owner can reject' });
    }

    if (pr.status !== 'open' && pr.requestingAccess) {
      return res.status(400).json({ message: `Pull request is already approved/rejected` });
    }

    pr.status = 'rejected';
    await pr.save();

    const repo = await RepositoryModel.findById(pr.repository);
    const notification = new NotificationModel({
      recipient: pr.from,
      sender: req.user.userId,
      type: 'pr_rejected',
      message: `rejected your access request to ${repo?.title || 'a repository'}`,
      repository: pr.repository
    });
    await notification.save();

    await pr.populate([
      { path: 'from', select: 'name email profileImage' },
      { path: 'to', select: 'name email profileImage' },
      { path: 'repository', select: 'title' }
    ]);

    res.json({ message: 'Pull request rejected', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting pull request', reason: err.message });
  }
});

export default pullRequestRouter;
