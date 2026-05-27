import {Schema,model} from 'mongoose'
//create article schema
const articleSchema = new Schema({
  title:{
    type:String,
    required:[true,"Title is required"]
  },
  description:{
    type:String,
    default:""
  },
  //owner is user id of the user who created the article
  owner:{
    type:Schema.Types.ObjectId,
    ref:"user" //name of user model
  },
  visibility:{
    type:String,
    enum:["public","private"],
    default:"public"
  },
  // Primary language (detected automatically from files)
  language:{
    type:String,
    default:"JavaScript"
  },
  // Language statistics - array of {language, percentage}
  languages:[{
    _id: false,
    language: String,      // e.g., "JavaScript", "CSS", "HTML"
    percentage: Number,    // e.g., 65, 20, 15
    color: String         // hex color for UI display
  }],
  createdAt:{
    type:Date,
    default:Date.now
  },
  updatedAt:{
    type:Date,
    default:Date.now
  },
  status:{
    type:String,
    enum:["active","inactive"],
    default:"active"
  },
  collaborators:[{
    type:Schema.Types.ObjectId,
    ref:"user"
  }]
},

{
  timestamps:true,
  versionKey:false
})

// Add indexes for query performance
articleSchema.index({ owner: 1 });  // Fast lookups by owner
articleSchema.index({ visibility: 1 });  // Fast visibility filtering
articleSchema.index({ title: 'text' });  // Text search on title
articleSchema.index({ owner: 1, status: 1 });  // Compound index for common queries
articleSchema.index({ createdAt: -1 });  // Sorting by creation date

export const RepositoryModel = model("repository",articleSchema);