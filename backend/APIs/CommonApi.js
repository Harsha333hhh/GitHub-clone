import exp from "express";
export const commonRouter=exp.Router();
import {authenticate} from '../services/authservices.js';
import { UserModel } from "../Models/UserModel.js";
import bcrypt from 'bcrypt';

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
};

// CHANGE PASSWORD ENDPOINT - Allows users to update their password securely
// bcrypt.compareSync(plain, hashed): synchronously compares old password with stored hashed password
// Verifies old password first to prevent unauthorized password changes
// Hashes new password with bcrypt before saving to ensure security
commonRouter.put("/change-password/:userId",async(req,res)=>{
    // get userId
    let userId=req.params.userId;
    // find user by userId
    let user=await UserModel.findById(userId);
    if(!user){
        return res.status(404).json({message:"User not found"})
    }
    // get old password from body
    let oldPassword=req.body.oldPassword;
    // get new passsword 
    let newPassword=req.body.newPassword;
    // verify old password is correct before allowing new password change
    if(bcrypt.compareSync(oldPassword,user.password)===true){
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({message:"Password changed successfully"})
    }else{
        res.status(401).json({message:"Old password is incorrect"})
    }

})
