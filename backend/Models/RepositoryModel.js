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
  language:{
    type:String,
    required:[true,"Language is required"]
  },
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
export const RepositoryModel = model("repository",articleSchema);