import { Schema,model } from "mongoose";
const fileSchema=new Schema(
    {
        fileName:
        {
            type:String,
            required:[true,"fileName is requried"],
        },
        path:
        {
            type:String,
            required:[true,"file path is requried"]
        },
        content:
        {
            type:String,
            required:[true,"file content is requried"]
        },
        size:
        {
            type:Number,
        },
        repoId:
        {
            type:Schema.Types.ObjectId,
            ref:"repository",
            required:[true,"repository Id is requried"]
        },
    
    },
    {
        timestamps:true,
        strict:"throw",
        versionKey:false
    }
);

// Add indexes for query performance
fileSchema.index({ repoId: 1 });  // Fast lookups by repository
fileSchema.index({ fileName: 1 });  // Fast file searches
fileSchema.index({ repoId: 1, fileName: 1 });  // Compound index for finding files in repos

export const fileModel=model("file",fileSchema)