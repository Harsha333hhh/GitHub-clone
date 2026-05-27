import {Schema,model} from 'mongoose'

// USER DATABASE SCHEMA - Defines structure for storing user data in MongoDB
// Unique constraint on email prevents duplicate accounts in database
// Password field stores bcrypt-hashed value (never plain text for security)
// repositories: array of ObjectId references linking to Repository model (one user can have many repos)
const userSchema = new Schema({
  name:{
    type:String,
    required:[true,"Name is required"]
  },
  email:{
    type:String,
    required:[true,"Email is required"],
    unique:[true,"Email already exists"]  // unique constraint prevents duplicate email accounts
  },
  password: {
    type: String,
    required:[true,"Password is required"]  // stores bcrypt hashed password, never plain text
  },
  profileImage:{
    type:String,
    default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  },
  bio:{
    type:String,
    default:""
  },
  // Followers array - stores user IDs of people following this user
  followers:[{
    type:Schema.Types.ObjectId,
    ref:"user"
  }],
  // Following array - stores user IDs that this user follows
  following:[{
    type:Schema.Types.ObjectId,
    ref:"user"
  }],
  //array of repository ids - ObjectId references to Repository collection
  repositories:[{
    type:Schema.Types.ObjectId,
    ref:"repository" //name of repository model - enables populate() for fetching full repo data
  }],
  createdAt:{
    type:Date,
    default:Date.now
  },
},{
  strict:"throw",
  timestamps:true,  // automatically adds createdAt and updatedAt fields
  versionKey:false  // removes __v field from documents
})

// Add indexes for query performance
userSchema.index({ email: 1 });  // Fast email lookups
userSchema.index({ name: 1 });   // Fast name searches
userSchema.index({ createdAt: -1 });  // Fast sorting by creation date

export const UserModel = model("user",userSchema);