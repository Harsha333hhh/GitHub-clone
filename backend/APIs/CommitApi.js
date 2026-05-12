import express from "express";
import { CommitModel } from "../Models/CommitModel.js";

const commitRouter = express.Router();


// Create Commit
commitRouter.post("/:repoId/commits", async (req, res) => {

  const newCommit = new CommitModel({
    repoId: req.params.repoId,
    ...req.body
  });

  const savedCommit = await newCommit.save();

  res.status(201).json(savedCommit);
});


// Get all commits of a repository
commitRouter.get("/:repoId/commits", async (req, res) => {

  const commits = await CommitModel.find({
    repoId: req.params.repoId
  })
  .populate("author")
  .populate("filesChanged");

  res.json(commits);
});


// Get single commit
commitRouter.get("/commit/:commitId", async (req, res) => {

  const commit = await CommitModel.findById(req.params.commitId)
  .populate("author")
  .populate("filesChanged");

  res.json(commit);
});


// Delete commit
commitRouter.delete("/commit/:commitId", async (req, res) => {

  await CommitModel.findByIdAndDelete(req.params.commitId);

  res.json({
    message: "Commit deleted successfully"
  });
});



export default commitRouter;