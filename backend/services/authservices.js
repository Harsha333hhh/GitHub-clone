import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { UserModel as User } from '../Models/UserModel.js';

dotenv.config();


// -------- REGISTER --------
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



// authenticate user and generate token
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
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    const userData = user.toObject();
    delete userData.password;

    return { token, user: userData };
};