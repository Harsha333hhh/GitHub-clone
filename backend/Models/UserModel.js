import {Schema,model} from 'mongoose'

//user schema
const userSchema = new Schema({
  name:{
    type:String,
    required:[true,"Name is required"]
  },
  email:{
    type:String,
    required:[true,"Email is required"],
    unique:[true,"Email already exists"]
  },
  password: {
    type: String,
    required:[true,"Password is required"]
  },
  profileImage:{
    type:String,
    default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  },
  bio:{
    type:String,
    required:[true,"Bio is required"],
    default:""
  },
  //followeres array of user ids 
  followers:[{
    type:Number,
    default:0
  }],
  //array of user ids 
  following:[{
    type:Number,
    default:0
  }],
  //array of repository ids
  repositories:[{
    type:Schema.Types.ObjectId,
    ref:"repository" //name of repository model
  }],
  createdAt:{
    type:Date,
    default:Date.now
  },
},{
  strict:"throw",
  timestamps:true,
  versionKey:false
})


export const UserModel = model("user",userSchema);