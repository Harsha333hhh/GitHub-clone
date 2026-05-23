import express from "express";
import { CommitModel } from "../Models/CommitModel.js";

const commitRouter = express.Router();


// Create Commit
commitRouter.post("/:repoId/commits", async (req, res) => {
  try {
    const newCommit = new CommitModel({
      repoId: req.params.repoId,
      ...req.body
    });

    const savedCommit = await newCommit.save();

    res.status(201).json(savedCommit);
  } catch (err) {
    res.status(500).json({ message: 'Error creating commit', reason: err.message });
  }
});


// Get all commits of a repository
commitRouter.get("/:repoId/commits", async (req, res) => {
  try {
    const commits = await CommitModel.find({
      repoId: req.params.repoId
    })
    .populate("author")
    .populate("filesChanged");

    res.json(commits);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching commits', reason: err.message });
  }
});


// Get single commit
commitRouter.get("/commit/:commitId", async (req, res) => {
  try {
    const commit = await CommitModel.findById(req.params.commitId)
    .populate("author")
    .populate("filesChanged");

    if (!commit) {
      return res.status(404).json({ message: 'Commit not found' });
    }
    res.json(commit);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching commit', reason: err.message });
  }
});


// Delete commit
commitRouter.delete("/commit/:commitId", async (req, res) => {
  try {
    const commit = await CommitModel.findByIdAndDelete(req.params.commitId);

    if (!commit) {
      return res.status(404).json({ message: 'Commit not found' });
    }
    res.json({
      message: "Commit deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting commit', reason: err.message });
  }
});



export default commitRouter;