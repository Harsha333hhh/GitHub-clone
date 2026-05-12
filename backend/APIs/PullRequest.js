import express from 'express';
import { PullRequestModel } from '../Models/PullRequetModel.js';
import { RepositoryModel } from '../Models/RepositoryModel.js';
import { NotificationModel } from '../Models/NotificationModel.js';

const pullRequestRouter = express.Router();

// Create a pull request (request access to a repo)
pullRequestRouter.post('/', async (req, res) => {
  try {
    const fromUserId = req.user.userId;
    const { repository, message } = req.body;

    if (!repository) {
      return res.status(400).json({ message: 'Repository ID is required' });
    }

    // Find the repo to get the owner
    const repo = await RepositoryModel.findById(repository).populate('owner', 'name');
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }

    // Can't request access to your own repo
    if (repo.owner._id.toString() === fromUserId) {
      return res.status(400).json({ message: 'You already own this repository' });
    }

    // Check if already a collaborator
    if (repo.collaborators && repo.collaborators.map(c => c.toString()).includes(fromUserId)) {
      return res.status(400).json({ message: 'You already have access to this repository' });
    }

    // Check for existing pending request
    const existing = await PullRequestModel.findOne({
      from: fromUserId,
      repository,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this repository' });
    }

    // Create pull request
    const pr = new PullRequestModel({
      from: fromUserId,
      to: repo.owner._id,
      repository,
      message: message || `Requesting access to ${repo.title}`
    });
    await pr.save();

    // Notify the repo owner
    const notification = new NotificationModel({
      recipient: repo.owner._id,
      sender: fromUserId,
      type: 'pull_request',
      message: `requested access to ${repo.title}`,
      repository
    });
    await notification.save();

    await pr.populate([
      { path: 'from', select: 'name email profileImage' },
      { path: 'to', select: 'name email profileImage' },
      { path: 'repository', select: 'title' }
    ]);

    res.status(201).json({ message: 'Pull request created', payload: pr });
  } catch (err) {
    res.status(500).json({ message: 'Error creating pull request', reason: err.message });
  }
});

// Get pull requests sent by the current user
pullRequestRouter.get('/sent', async (req, res) => {
  try {
    const prs = await PullRequestModel.find({ from: req.user.userId })
      .populate('from', 'name email profileImage')
      .populate('to', 'name email profileImage')
      .populate('repository', 'title')
      .sort({ createdAt: -1 });

    res.json({ message: 'Sent pull requests', payload: prs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull requests', reason: err.message });
  }
});

// Get pull requests received by the current user (as repo owner)
pullRequestRouter.get('/received', async (req, res) => {
  try {
    const prs = await PullRequestModel.find({ to: req.user.userId })
      .populate('from', 'name email profileImage')
      .populate('to', 'name email profileImage')
      .populate('repository', 'title')
      .sort({ createdAt: -1 });

    res.json({ message: 'Received pull requests', payload: prs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pull requests', reason: err.message });
  }
});

// Approve a pull request
pullRequestRouter.put('/:prId/approve', async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    // Only the recipient (repo owner) can approve
    if (pr.to.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the repository owner can approve' });
    }

    if (pr.status !== 'pending') {
      return res.status(400).json({ message: `Pull request is already ${pr.status}` });
    }

    pr.status = 'approved';
    await pr.save();

    // Add requester as collaborator
    await RepositoryModel.findByIdAndUpdate(pr.repository, {
      $addToSet: { collaborators: pr.from }
    });

    // Notify requester
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

// Reject a pull request
pullRequestRouter.put('/:prId/reject', async (req, res) => {
  try {
    const pr = await PullRequestModel.findById(req.params.prId);
    if (!pr) {
      return res.status(404).json({ message: 'Pull request not found' });
    }

    // Only the recipient (repo owner) can reject
    if (pr.to.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the repository owner can reject' });
    }

    if (pr.status !== 'pending') {
      return res.status(400).json({ message: `Pull request is already ${pr.status}` });
    }

    pr.status = 'rejected';
    await pr.save();

    // Notify requester
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
