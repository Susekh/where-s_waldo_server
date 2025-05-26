import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
import validator from 'validator';

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            return res.status(401).json({ error: "Token not found" });
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
           return res.status(401).json({ error: "Invalid token" });
        }
    
        req.user = user;
        next()
    } catch (error) {
        return res.status(500).json({ error: "Error occured in authorizing the user", message : error.message });
    }
    
})

export const validateSignup = asyncHandler(async(req, res, next) => {
  console.log("=== VALIDATE SIGNUP START ===");
  const { username, password, email } = req.body;
  console.log("Request body:", req.body);
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("email:", email);

  // Username validation
  console.log("Checking username length...");
  if (!username || !validator.isLength(username.trim(), { min: 3, max: 20 })) {
    console.log("Username length failed");
    return res.status(400).json({
      success: false,
      error : 'Username must be 3-20 characters'
    });
  }

  console.log("Checking username alphanumeric...");
  if (!validator.isAlphanumeric(username.trim().replace(/_/g, ''))) {
    console.log("Username alphanumeric failed");
    return res.status(400).json({
      success: false,
      error : 'Username: only letters, numbers, underscore allowed'
    });
  }

  // Check if username exists
  console.log("Checking if username exists...");
  const existingUser = await User.findOne({ username: username.trim() });
  if (existingUser) {
    console.log("Username already exists");
    return res.status(400).json({
      success: false,
      error : 'Username already taken'
    });
  }

  // Password validation
  console.log("Checking password length...");
  if (!password || !validator.isLength(password, { min: 8 })) {
    console.log("Password length failed");
    return res.status(400).json({
      success: false,
      error : 'Password must be at least 8 characters'
    });
  }

  console.log("Checking password strength...");
  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })) {
    console.log("Password strength failed");
    return res.status(400).json({
      success: false,
      error : 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    });
  };

  if (!validator.isEmail(email)){
    return res.status(400).json({
        success : false,
        error : 'email is required'
    })
  }

  console.log("=== VALIDATION PASSED, CALLING NEXT ===");
  next();
});

export const validateLogin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  // Username validation
  if (!username || validator.isEmpty(username.trim())) {
    return res.status(200).json({
      success: false,
      error: 'Username is required'
    });
  }

  // Password validation
  if (!password || validator.isEmpty(password)) {
    return res.status(200).json({
      success: false,
      error: 'Password is required'
    });
  }

  next();
});