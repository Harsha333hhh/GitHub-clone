import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies?.token

    // Allow Authorization header also (Bearer token)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    // Verify the token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded

    next()

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    
    // Provide specific error messages for debugging
    let message = "Invalid or expired token";
    if (err.name === 'TokenExpiredError') {
      message = "Token expired";
    } else if (err.name === 'JsonWebTokenError') {
      message = "Invalid token format or signature";
    }
    
    return res.status(401).json({
      message: message,
      reason: err.message
    })
  }
}
