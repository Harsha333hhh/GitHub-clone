// USER CONTROLLER - Wrapper functions for business logic (MVC pattern)
// Separates route handlers from service layer for cleaner code organization
// register(): calls authservices.register() to handle user signup with bcrypt password hashing
import { register as registerUser } from '../services/authservices.js'

export const register = async (userData) => {
  return await registerUser(userData)
}
