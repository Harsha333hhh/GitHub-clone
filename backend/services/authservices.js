import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel as User } from '../Models/UserModel.js';

dotenv.config();


// REGISTER FUNCTION - Creates new user account with secure password storage
// bcrypt.genSalt(10): generates random salt (2^10=1024 iterations) added before hashing
// bcrypt.hash(): one-way encryption making password unreadable (cannot be reversed even if database leaked)
// Removes password before returning to ensure sensitive data never sent to frontend
export const register = async (userObject) => {

    const user = new User(userObject);

    // hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return userData;
};



// AUTHENTICATE FUNCTION - Verifies user credentials and generates JWT token
// bcrypt.compare(plain, hashed): securely compares entered password with stored hashed password without exposing hash
// jwt.sign(): creates signed token containing userId+email, only server can verify using JWT_SECRET
// Token expires in 1 day (24 hours) for security, user must re-login after expiration
export const authenticate = async ({ email, password }) => {

    if (!password) {
        let err = new Error("Password required");
        err.status = 400;
        throw err;
    }

    const user = await User.findOne({ email });

    if (!user) {
        let err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
    }

    //compare passsword
    const ismatch = await bcrypt.compare(password, user.password);

    if (!ismatch) {
        let err = new Error("invalid password");
        err.status = 401;
        throw err;
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return { token, user: userData };
};