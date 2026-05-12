import jwt from "jsonwebtoken";
import { config } from "dotenv"; //for secret key
config();
export const verifyToken = (...allowedRoles) => {
    return (req, res, next) => {
        let token = req.cookies.token;
    //verify the token(decoding the token)
    try {
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Role-based authorization removed
        req.user = decoded;
        next();
    } catch (err) {
        if(err.name==="TokenExpiredError"){
            return res.status(401).json({ message: "Token Expired" });
        }
        if(err.name==="JsonWebTokenError"){
            return res.status(401).json({ message: "Invalid Token" });
        }
        
    }
    //read token from req
    
        //next(err)
    }
}