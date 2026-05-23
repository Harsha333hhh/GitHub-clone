import express from "express";
import { IssueTypeModel } from "../Models/IssueModel.js";

const issueRouter = express.Router();


// Create Issue
issueRouter.post("/:repoId/issues", async (req,res)=>{
  try {
    const issue = new IssueTypeModel({
      repoId:req.params.repoId,
      ...req.body
    });

    const savedIssue = await issue.save();

    res.status(201).json(savedIssue);
  } catch (err) {
    res.status(500).json({ message: 'Error creating issue', reason: err.message });
  }
});


// Get all issues of a repository
issueRouter.get("/:repoId/issues", async (req,res)=>{
  try {
    const issues = await IssueTypeModel.find({
      repoId:req.params.repoId
    })
    .populate("author");

    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues', reason: err.message });
  }
});


// Get single issue
issueRouter.get("/issue/:issueId", async (req,res)=>{
  try {
    const issue = await IssueTypeModel.findById(req.params.issueId)
    .populate("author");

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issue', reason: err.message });
  }
});


// Update issue (change title, description, status)
issueRouter.put("/issue/:issueId", async (req,res)=>{
  try {
    const updatedIssue = await IssueTypeModel.findByIdAndUpdate(
      req.params.issueId,
      req.body,
      {new:true}
    );

    if (!updatedIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(updatedIssue);
  } catch (err) {
    res.status(500).json({ message: 'Error updating issue', reason: err.message });
  }
});


// Delete issue
issueRouter.delete("/issue/:issueId", async (req,res)=>{
  try {
    const issue = await IssueTypeModel.findByIdAndDelete(req.params.issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json({
      message:"Issue deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting issue', reason: err.message });
  }
});

export default issueRouter;