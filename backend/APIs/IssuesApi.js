import express from "express";
import { IssueTypeModel } from "../Models/IssueModel.js";

const issueRouter = express.Router();


// Create Issue
issueRouter.post("/:repoId/issues", async (req,res)=>{

  const issue = new IssueTypeModel({
    repoId:req.params.repoId,
    ...req.body
  });

  const savedIssue = await issue.save();

  res.status(201).json(savedIssue);
});


// Get all issues of a repository
issueRouter.get("/:repoId/issues", async (req,res)=>{

  const issues = await IssueTypeModel.find({
    repoId:req.params.repoId
  })
  .populate("author");

  res.json(issues);
});


// Get single issue
issueRouter.get("/issue/:issueId", async (req,res)=>{

  const issue = await IssueTypeModel.findById(req.params.issueId)
  .populate("author");

  res.json(issue);
});


// Update issue (change title, description, status)
issueRouter.put("/issue/:issueId", async (req,res)=>{

  const updatedIssue = await IssueTypeModel.findByIdAndUpdate(
    req.params.issueId,
    req.body,
    {new:true}
  );

  res.json(updatedIssue);
});


// Delete issue
issueRouter.delete("/issue/:issueId", async (req,res)=>{

  await IssueTypeModel.findByIdAndDelete(req.params.issueId);

  res.json({
    message:"Issue deleted successfully"
  });
});

export default issueRouter;