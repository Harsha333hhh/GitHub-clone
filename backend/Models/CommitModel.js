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

// Add indexes for query performance
commitSchema.index({ repoId: 1 });  // Fast lookups by repository
commitSchema.index({ author: 1 });  // Fast lookups by author
commitSchema.index({ commitHash: 1 });  // Fast hash lookups
commitSchema.index({ repoId: 1, createdAt: -1 });  // Compound index for repository commit history

export const CommitModel = model("commit", commitSchema);