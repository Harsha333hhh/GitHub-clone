import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const authMiddleware = (req, res, next) => {
  try {

    let token = req.cookies?.token

    // allow Authorization header also
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)

    req.user = decoded

    next()

  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      reason: err.message
    })
  }
}
