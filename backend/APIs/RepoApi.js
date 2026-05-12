import express from 'express'
import { RepositoryModel } from '../Models/RepositoryModel.js';

export const repositoryRoute = express.Router()

// Get all repositories
repositoryRoute.get('/repositories', async (req, res) => {
    try {
        const repositories = await RepositoryModel.find().populate('owner', 'name email profileImage');
        res.status(200).json({ message: "Repositories retrieved successfully", payload: repositories });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving repositories", reason: err.message });
    }
});

// Get a specific repository by ID
repositoryRoute.get('/repo/:repoId', async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const repository = await RepositoryModel.findById(repoId)
          .populate('owner', 'name email profileImage')
          .populate('collaborators', 'name email profileImage');
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.status(200).json({ message: "Repository retrieved successfully", payload: repository });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving repository", reason: err.message });
    }
});

// create repositories
repositoryRoute.post('/repositories',async(req,res)=>{
    try {
        // get repositories from req
        let repositoryData=req.body;
        //check for owner
        let ownerId=req.user.userId;
        if(!ownerId){
            return res.status(401).json({message:"Unauthorized"})
        }
        // create repository document 
        let repository=new RepositoryModel({...repositoryData,owner:ownerId});
        // save repository 
        let createdrepository=await repository.save();
        // populate owner info before sending response
        await createdrepository.populate('owner', 'name email profileImage');
        // send res
        res.status(201).json({message:"Repository created successfully",payload:createdrepository})
    } catch (err) {
        res.status(500).json({message:"Error creating repository",reason:err.message})
    }
})

// read all repositories by user id 
repositoryRoute.get('/repositories/user/:userId',async(req,res)=>{
    try {
        let userId = req.params.userId;
        if(!userId){
            return res.status(400).json({message:"User ID is required"})
        }
        // read repositories by this owner 
        let repositories = await RepositoryModel.find({owner:userId}).populate('owner', 'name email profileImage');
        // send res 
        res.status(200).json({message:"Repositories retrieved successfully",payload:repositories})
    } catch (err) {
        res.status(500).json({message:"Error retrieving repositories",reason:err.message})
    }
})

// read repositories by user id (removing duplicate endpoint)
// repositoryRoute.get('/repositories/user/:userId',async(req,res)=>{ ... })

// read repositories of owner which are active
repositoryRoute.get('/repositories/:userId',async(req,res)=>{
    try {
        let userId = req.params.userId
        // read active repositories by this owner 
        let repositories = await RepositoryModel.find({owner:userId,status:"active"}).populate('owner', 'name email profileImage');
        // send res 
        res.status(200).json({message:"Repositories retrieved successfully",payload:repositories}) 
    } catch (err) {
        res.status(500).json({message:"Error retrieving repositories",reason:err.message})
    }
})

//update repository
repositoryRoute.put('/repositories/:repositoryId',async(req,res)=>{
    try {
        let repositoryId=req.params.repositoryId;
        let updateData=req.body;
        let ownerId=req.user.userId;
        
        // find repository and update
        let repository=await RepositoryModel.findByIdAndUpdate(repositoryId,updateData,{new:true}).populate('owner', 'name email profileImage');
        
        if(!repository){
            return res.status(404).json({message:"Repository not found"})
        }
        // send res 
        res.status(200).json({message:"Repository updated successfully",payload:repository})
    } catch (err) {
        res.status(500).json({message:"Error updating repository",reason:err.message})
    }
})

// delete repository (OWNER ONLY)
repositoryRoute.delete('/repositories/:repositoryId',async(req,res)=>{
    try {
        let repositoryId=req.params.repositoryId;
        let userId=req.user.userId;
        
        // Find repo first to check ownership
        let repository=await RepositoryModel.findById(repositoryId);
        if(!repository){
            return res.status(404).json({message:"Repository not found"})
        }
        
        // Only the owner can delete
        if(repository.owner.toString() !== userId){
            return res.status(403).json({message:"Only the repository owner can delete this repository"})
        }
        
        await RepositoryModel.findByIdAndDelete(repositoryId);
        res.status(200).json({message:"Repository deleted successfully",payload:repository})
    } catch (err) {
        res.status(500).json({message:"Error deleting repository",reason:err.message})
    }
})

// add comment to repository
repositoryRoute.post('/repositories/:repositoryId/comments',async(req,res)=>{
    try {
        const comment = req.body.comment;
        const repositoryId = req.params.repositoryId;
        const userId = req.user.userId;
        const repository = await RepositoryModel.findById(repositoryId);
        if(!repository){
            return res.status(404).json({message:"Repository not found"})
        }
        repository.comments.push({ comment, user: userId });
        await repository.save();
        res.status(201).json({message:"Comment added successfully",payload:repository})
    } catch (err) {
        res.status(500).json({message:"Error adding comment",reason:err.message})
    }
})
