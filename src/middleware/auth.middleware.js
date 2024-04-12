import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        console.log(req.cookies.accessToken);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            console.log("Token not found");
            return res.status(401).json({ error: "Token not found" });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
           console.log("Invalid token");
           return res.status(401).json({ error: "Invalid token" });
        }
    
        req.user = user;
        next()
    } catch (error) {
        return res.status(500).json({ error: "Error occured in authorizing the user", message : error.message });
    }
    
})