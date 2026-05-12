import { Schema, model } from "mongoose";

const commitSchema = new Schema(
  {
     repoId: {
      type: Schema.Types.ObjectId,
      ref: "repository",
      required: [true, "Repository id is required"]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    message: {
      type: String,
      required: [true, "Commit message is required"]
    },
    
    filesChanged: [
      {
        type: Schema.Types.ObjectId,
        ref: "file"
      }
    ],
    commitHash: {
      type: String,
      required: [true, "Commit hash is required"],
      unique: [true, "Commit hash already exists"]
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false
  }
);

export const CommitModel = model("commit", commitSchema);