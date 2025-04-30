import asyncHandler from "../utils/asyncHandler.js";
import { validationResult, check } from "express-validator";
import bcrypt from 'bcryptjs'
import userModel from "../models/user.model.js";
import UserStatusModel from "../models/userStatus.model.js";

// Define validation rules
export const signupValidation = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .isLength({ max: 30 }).withMessage('Username cannot exceed 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value) => {
      const existingUser = await userModel.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return true;
    }),
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character')
];

export const loginValidation = [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  check('password')
    .notEmpty().withMessage('Password is required')
];

const generateAccessAndRefereshTokens = async(userId, res) =>{
  try {
      const user = await userModel.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      res.status(500).json({ error : "Unable to Login User", message : error.message });
  }
}


const signUpPost = asyncHandler(
    
    async (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
      }
      
      try {
        const { username, password } = req.body;
        
        bcrypt.hash(password, 10, async(err, hashedPassword) => {
          if(err){
            throw err;
          } else {
             const user = new userModel({
                username : username,
                password: hashedPassword
            });
            await user.save();
            
            res.status(201).json({ message : "User created Successfully" });
          }
        });
    
      } catch(err) {
        res.status(500).json({ error: "Unable to create User" });
      }
    }
  
)



//login part


const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password } = req.body;
  
    const user = await userModel.findOne({ username });
  
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password is incorrect" });
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id, res);
  
    const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken");
  
    // Check if userStatus exists for the logged-in user
      let userStatus = await UserStatusModel.findOne({ user: user._id });
      if(!userStatus){
        userStatus = new UserStatusModel({ 
          user: user._id, 
          charactersFound: [], 
          timeOfCompletion : 0,
          isOver : false});
      }
    
      await userStatus.save();

    const charArr = userStatus && userStatus.charactersFound ? userStatus.charactersFound : [];
  
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
  
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "User logged In Successfully", user: loggedInUser, charArr : charArr });
  } catch (error) {
    res.status(400).json({ message : "unable to login user" })
  }
});




//logout part

const logout = asyncHandler(async(req, res) => {
  await userModel.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json({message : "User logged Out"})
})



export {
  signUpPost,
  loginUser,
  logout,
  bcrypt
}