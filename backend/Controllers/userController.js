// User controller functions
import { register as registerUser } from '../services/authservices.js'

export const register = async (userData) => {
  return await registerUser(userData)
}
