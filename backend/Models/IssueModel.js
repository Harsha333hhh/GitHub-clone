import { Schema, model } from "mongoose";

const issueSchema = new Schema(
{
  repoId:{
    type:Schema.Types.ObjectId,
    ref:"repository",
    required:[true,"RepoId is required"]
  },

  title:{
    type:String,
    required:[true,"Title is required"]
  },

  description:{
    type:String,
    required:[true,"Description is required"]
  },

  author:{
    type:Schema.Types.ObjectId,
    ref:"user"
  },

  status:{
    type:String,
    enum:["open","closed"],
    default:"open"
  },

  comments:[
    {
      type:Schema.Types.ObjectId,
      ref:"comment"
    }
  ]
},
{
  timestamps:true,
  strict:"throw",
  versionKey:false
}
);

// Add indexes for query performance
issueSchema.index({ repoId: 1 });  // Fast lookups by repository
issueSchema.index({ author: 1 });  // Fast lookups by author
issueSchema.index({ status: 1 });  // Fast filtering by status
issueSchema.index({ repoId: 1, status: 1 });  // Compound index for common queries

export const IssueTypeModel = model("issue",issueSchema);