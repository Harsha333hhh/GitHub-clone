import express from "express";
import { fileModel } from "../Models/FileModel.js";
import { RepositoryModel } from "../Models/RepositoryModel.js";
import { NotificationModel } from "../Models/NotificationModel.js";
import { authMiddleware } from "../Middlewares/authMiddleware.js";
import { calculateLanguageStats, getPrimaryLanguage } from "../utils/languageDetector.js";

const filerouter = express.Router();

// Helper: check if user is owner or collaborator
async function checkWriteAccess(userId, repoId) {
  const repo = await RepositoryModel.findById(repoId);
  if (!repo) return { allowed: false, repo: null, isOwner: false };
  const isOwner = repo.owner.toString() === userId;
  const isCollaborator = repo.collaborators && repo.collaborators.map(c => c.toString()).includes(userId);
  return { allowed: isOwner || isCollaborator, repo, isOwner };
}

// Helper: recalculate repository language statistics
async function updateRepositoryLanguages(repoId) {
  try {
    const files = await fileModel.find({ repoId });
    const stats = calculateLanguageStats(files);
    const primaryLang = getPrimaryLanguage(stats);
    
    await RepositoryModel.findByIdAndUpdate(repoId, {
      languages: stats,
      language: primaryLang,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating language stats:', error);
  }
}

// Upload file (auth required, owner or collaborator only)
filerouter.post("/:repoId/files", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { allowed, repo, isOwner } = await checkWriteAccess(userId, req.params.repoId);

    if (!allowed) {
      return res.status(403).json({ message: "You do not have write access to this repository" });
    }

    const file = new fileModel({
      repoId: req.params.repoId,
      ...req.body
    });
    await file.save();

    // Recalculate language statistics for repository
    await updateRepositoryLanguages(req.params.repoId);

    // Notify owner if a collaborator created the file
    if (!isOwner) {
      const notification = new NotificationModel({
        recipient: repo.owner,
        sender: userId,
        type: 'file_created',
        message: `created file "${req.body.fileName || 'a file'}" in ${repo.title}`,
        repository: req.params.repoId
      });
      await notification.save();
    }

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: "error", reason: error.message });
  }
});

// Get files (public - no auth required)
filerouter.get("/:repoId/files", async (req, res) => {
  try {
    const files = await fileModel.find({ repoId: req.params.repoId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "error", reason: error.message });
  }
});

// Get file content by path (public - no auth required)
filerouter.get("/:repoId", async (req, res) => {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ message: "Path query parameter is required" });
    }

    const file = await fileModel.findOne({
      repoId: req.params.repoId,
      fileName: path.replace(/^\//, '') // Remove leading slash if present
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ content: file.content });
  } catch (error) {
    res.status(500).json({ message: "error", reason: error.message });
  }
});

// Update file (auth required, owner or collaborator only)
filerouter.put("/files/:fileId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const existingFile = await fileModel.findById(req.params.fileId);
    if (!existingFile) {
      return res.status(404).json({ message: "File not found" });
    }

    const { allowed, repo, isOwner } = await checkWriteAccess(userId, existingFile.repoId);
    if (!allowed) {
      return res.status(403).json({ message: "You do not have write access to this repository" });
    }

    const file = await fileModel.findByIdAndUpdate(
      req.params.fileId,
      req.body,
      { new: true }
    );

    // Recalculate language statistics for repository
    await updateRepositoryLanguages(existingFile.repoId);

    // Notify owner if a collaborator updated the file
    if (!isOwner) {
      const notification = new NotificationModel({
        recipient: repo.owner,
        sender: userId,
        type: 'file_updated',
        message: `updated file "${existingFile.fileName || 'a file'}" in ${repo.title}`,
        repository: existingFile.repoId
      });
      await notification.save();
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: "error", reason: error.message });
  }
});

// Delete file (auth required, owner only - NOT collaborators)
filerouter.delete("/files/:fileId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const existingFile = await fileModel.findById(req.params.fileId);
    if (!existingFile) {
      return res.status(404).json({ message: "File not found" });
    }

    const { allowed, repo, isOwner } = await checkWriteAccess(userId, existingFile.repoId);
    if (!allowed) {
      return res.status(403).json({ message: "You do not have write access to this repository" });
    }

    if (!isOwner) {
      return res.status(403).json({ message: "Only repository owner can delete files." });
    }

    await fileModel.findByIdAndDelete(req.params.fileId);

    // Recalculate language statistics for repository
    await updateRepositoryLanguages(existingFile.repoId);

    // Notify owner if a collaborator deleted the file
    if (!isOwner) {
      const notification = new NotificationModel({
        recipient: repo.owner,
        sender: userId,
        type: 'file_deleted',
        message: `deleted file "${existingFile.fileName || 'a file'}" from ${repo.title}`,
        repository: existingFile.repoId
      });
      await notification.save();
    }

    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: "error", reason: error.message });
  }
});

export default filerouter;