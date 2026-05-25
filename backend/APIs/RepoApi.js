import express from 'express'
import { RepositoryModel } from '../Models/RepositoryModel.js';
import { UserModel } from '../Models/UserModel.js';
import { NotificationModel } from '../Models/NotificationModel.js';
import { authMiddleware } from '../Middlewares/authMiddleware.js';

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
        console.log("=== Repository Creation Request ===");
        console.log("Body:", req.body);
        console.log("User from middleware:", req.user);
        
        // get repositories from req
        let repositoryData=req.body;
        
        //check for owner
        let ownerId=req.user?.userId;
        console.log("Owner ID:", ownerId);
        
        if(!ownerId){
            console.log("No user ID found");
            return res.status(401).json({message:"Unauthorized", reason: "No user ID in token"})
        }
        
        // Ensure required fields
        if (!repositoryData.title) {
            console.log("Missing title");
            return res.status(400).json({message:"Title is required"});
        }
        
        // create repository document 
        let repository=new RepositoryModel({
            title: repositoryData.title,
            description: repositoryData.description || "",
            language: repositoryData.language || "JavaScript",
            visibility: repositoryData.visibility || "public",
            status: repositoryData.status || "active",
            owner: ownerId
        });
        
        console.log("Repository object created:", repository);
        
        // save repository 
        let createdrepository=await repository.save();
        console.log("Repository saved:", createdrepository._id);
        
        // Add repository to user's repositories array
        await UserModel.findByIdAndUpdate(ownerId, { $push: { repositories: createdrepository._id } });
        console.log("Repository added to user's repositories array");
        
        // populate owner info before sending response
        await createdrepository.populate('owner', 'name email profileImage');
        console.log("Repository populated with owner info");
        
        // send res
        res.status(201).json({message:"Repository created successfully",payload:createdrepository})
    } catch (err) {
        console.error("=== Repository Creation Error ===");
        console.error("Error message:", err.message);
        console.error("Error name:", err.name);
        console.error("Error details:", err.errors || err);
        console.error("Stack trace:", err.stack);
        
        res.status(500).json({
            message:"Error creating repository",
            reason:err.message,
            details: err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : []
        })
    }
})

// read all repositories by user id (SPECIFIC ROUTE - must come BEFORE generic :userId route)
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

// read repositories of owner which are active (GENERIC ROUTE - must come AFTER specific routes)
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
        
        // Remove repository from user's repositories array
        await UserModel.findByIdAndUpdate(userId, { $pull: { repositories: repositoryId } });
        
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

// Add collaborator by email (OWNER ONLY)
repositoryRoute.post('/repositories/:repositoryId/collaborators', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        const repositoryId = req.params.repositoryId;
        const userId = req.user.userId;

        // Validate input
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Find repository
        const repository = await RepositoryModel.findById(repositoryId);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Check if user is owner
        if (repository.owner.toString() !== userId) {
            return res.status(403).json({ message: "Only the repository owner can add collaborators" });
        }

        // Find user by email
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Check if user is already a collaborator
        if (repository.collaborators.some(collab => collab.toString() === user._id.toString())) {
            return res.status(400).json({ message: "User is already a collaborator" });
        }

        // Check if user is owner
        if (repository.owner.toString() === user._id.toString()) {
            return res.status(400).json({ message: "User is already the owner" });
        }

        // Add collaborator
        repository.collaborators.push(user._id);
        await repository.save();

        // Send notification to the new collaborator
        const notification = new NotificationModel({
            recipient: user._id,
            sender: userId,
            type: 'collaborator_added',
            message: `added you as a collaborator on ${repository.title}`,
            repository: repositoryId
        });
        await notification.save();

        // Populate and return updated repository
        const updatedRepo = await RepositoryModel.findById(repositoryId)
            .populate('owner', 'name email profileImage')
            .populate('collaborators', 'name email profileImage');

        res.status(200).json({ 
            message: "Collaborator added successfully", 
            payload: updatedRepo 
        });
    } catch (err) {
        res.status(500).json({ message: "Error adding collaborator", reason: err.message });
    }
});

// Remove collaborator (OWNER ONLY)
repositoryRoute.delete('/repositories/:repositoryId/collaborators/:collaboratorId', authMiddleware, async (req, res) => {
    try {
        const { repositoryId, collaboratorId } = req.params;
        const userId = req.user.userId;

        // Find repository
        const repository = await RepositoryModel.findById(repositoryId);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        // Check if user is owner
        if (repository.owner.toString() !== userId) {
            return res.status(403).json({ message: "Only the repository owner can remove collaborators" });
        }

        // Check if collaborator exists
        const collaboratorIndex = repository.collaborators.findIndex(
            collab => collab.toString() === collaboratorId
        );

        if (collaboratorIndex === -1) {
            return res.status(404).json({ message: "Collaborator not found" });
        }

        // Remove collaborator
        repository.collaborators.splice(collaboratorIndex, 1);
        await repository.save();

        // Populate and return updated repository
        const updatedRepo = await RepositoryModel.findById(repositoryId)
            .populate('owner', 'name email profileImage')
            .populate('collaborators', 'name email profileImage');

        res.status(200).json({ 
            message: "Collaborator removed successfully", 
            payload: updatedRepo 
        });
    } catch (err) {
        res.status(500).json({ message: "Error removing collaborator", reason: err.message });
    }
});

// Get all collaborators for a repository
repositoryRoute.get('/repositories/:repositoryId/collaborators', async (req, res) => {
    try {
        const { repositoryId } = req.params;

        // Find repository
        const repository = await RepositoryModel.findById(repositoryId)
            .populate('collaborators', 'name email profileImage');

        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        res.status(200).json({ 
            message: "Collaborators retrieved successfully", 
            payload: repository.collaborators 
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving collaborators", reason: err.message });
    }
});
