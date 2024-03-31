import asyncHandler from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import bcrypt from 'bcryptjs'
import userModel from "../models/user.model.js";


const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await userModel.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      console.log(error);
  }
}


const signUpPost = asyncHandler(
    
    async (req, res) => {
      const errors = validationResult(req);
      if(errors.isEmpty()){
        try {
          const { username, password } = req.body;
          console.log("userName : ", username);
          console.log("PassWord : ", password);
           // Check if username already exists
           const existingUser = await userModel.findOne({ username });
           if (existingUser) {
             return res.status(400).json({ message: "Username already exists" });
           }
      
          bcrypt.hash(password, 10, async(err, hashedPassword) => {
            if(err){
              throw err;
            } else {
               const user = new userModel({
                  username : username,
                  password: hashedPassword
              });
              await user.save();
            }
          });
      
          res.status(201).json({ message : "User created Succesfully" });
        } catch(err) {
          res.status(500).json({ message: "Server error in catch" });
        }
      } else {
        res.status(500).json({ message : "server error" })
      }
    }
  
)



//login part


const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {username, password} = req.body

  if (!username) {
      return res.status(400).json({ message : "username is required" });
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await userModel.findOne({username})

  if (!user) {
      res.status(401).json( { message : "user not valid" } )
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);


 if (!isPasswordValid) {
  res.status(401).json({ message : "Invalid user credentials" });
}

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
  console.log("Access Token : ",accessToken);
  console.log("Refresh Token : ",refreshToken);
  const loggedInUser = await userModel.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
  }

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({message : "User logged In Successfully", user : loggedInUser})

})





//logout part

const logout = asyncHandler(async(req, res) => {
  console.log( "User :", req.user);
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