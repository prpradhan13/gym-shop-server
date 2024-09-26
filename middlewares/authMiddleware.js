import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const verifyJWT = async (req, res, next) => {
    try {
        // Extract token from cookie or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        // Verify token
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log("Decoded token:", decodedtoken);

        // Find user by decoded token's ID, excluding password and refreshToken fields
        const user = await UserModel.findById(decodedtoken._id).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.log(error)
        res.status(500).send({success: false, message: "Something went wrong in verifyJWT middleware", error})
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const admin = await UserModel.findById(req.user._id).select('-password -refreshToken');
        if(admin?.isAdmin === false){
            return res
            .status(404)
            .send({
                success: false, 
                message: "Invalid access Admin",
            }) 
        } else {
            next();
        }

    } catch (error) {
        console.log(error)
        res.status(500).send({message: "Something went wrong isAdmin middleware", error: error.message});
    }
};