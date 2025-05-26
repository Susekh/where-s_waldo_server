import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from 'bcryptjs';
import userModel from "../models/user.model.js";
import UserStatusModel from "../models/userStatus.model.js";

const generateAccessAndRefereshTokens = async(userId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Unable to generate tokens: ${error.message}`);
  }
};

const signUpPost = asyncHandler(async (req, res) => {

  try {
    const { username, password, email } = req.body;

    // Check if username already exists
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success : false , error: "Username already exists" });
    };
    
    //check if email already exists
    const existingEmail = await userModel.findOne({email});
    if(existingEmail) {
      return res.status(409).json({ success : false, error: "Email already exists" });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new userModel({
      username,
      password: hashedPassword,
      email
    });
    
    await user.save();
    return res.status(201).json({ 
      success: true,
      message: "User created successfully" 
    });
    
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ 
      error: "Unable to create user",
      message: err.message 
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {

  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    // Get user data without sensitive fields
    const loggedInUser = await userModel
      .findById(user._id)
      .select("-password -refreshToken");

    // Find or create user status
    let userStatus = await UserStatusModel.findOne({ user: user._id });
    if (!userStatus) {
      userStatus = new UserStatusModel({
        user: user._id,
        charactersFound: [],
        timeOfCompletion: 0,
        isOver: false,
      });
      await userStatus.save();
    }

    const charArr = userStatus?.charactersFound || [];

    // Set cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "User logged in successfully",
        user: loggedInUser,
        charArr,
      });
      
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      error: "Unable to login user", 
      message: error.message 
    });
  }
});

const logout = asyncHandler(async(req, res) => {
  try {
    // Verify user exists in request
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    // Remove refresh token
    await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1 
        }
      },
      { new: true }
    );
  
    // Clear cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        success: true,
        message: "User logged out successfully"
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ 
      error: "Unable to logout user", 
      message: error.message 
    });
  }
});

export {
  signUpPost,
  loginUser,
  logout
};