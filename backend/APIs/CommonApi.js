import exp from "express";
export const commonRouter=exp.Router();
import {authenticate} from '../services/authservices.js';
import { UserModel } from "../Models/UserModel.js";
import bcrypt from 'bcryptjs';

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
};
// login
commonRouter.post("/login",async(req,res)=>{
    let userCred=req.body;
    let {token,user}=await authenticate(userCred);
    //save token as http only cookie 
        res.cookie("token",token,cookieOptions)
    // send res 
    res.status(200).json({message:"Login successful",token,payload:user})

})
// logout
commonRouter.post("/logout",async(req,res)=>{
    res.clearCookie('token', cookieOptions)// must match original cookie options
  res.status(200).json({ message: 'Logout successful' })
})


// password change 

commonRouter.put("/change-password/:userId",async(req,res)=>{
    // get userId
    let userId=req.params.userId;
    // find user by userId
    let user=await UserModel.findById(userId);
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    // print user details for testing 
    //res.status(200).json({message:"User details",payload:user})
    // get old password from database 
    // get old password from body
    let oldPassword=req.body.oldPassword;
    // get new passsword 
    let newPassword=req.body.newPassword;
    // authenticate user with old password 
    //check if old password is correct or not
    if(bcrypt.compareSync(oldPassword,user.password)===true){
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({message:"Password changed successfully"})
    }else{
        res.status(401).json({message:"Old password is incorrect"})
    }

})
