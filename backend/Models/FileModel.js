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
export const fileModel=model("file",fileSchema)