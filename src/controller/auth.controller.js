import asyncHandler from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";
import bcrypt from 'bcryptjs'
import userModel from "../models/user.model.js";
import passport from "../middleware/passport/passport.js"



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

const login_middleware = passport.authenticate("local")
const login_controller = (req , res) => {
  console.log(req.body);
 if(req.user){
    res.status(201).json({ message : "login successful" })
    console.log(req.user);
 } else {
    res.status(400).json({ message :  "couldn't login user"})
 }
}




//logout part

const logout = (req, res, next) => {
    req.logout((err) => {
    if (err) {
        return next(err);
    }
    res.status(201).json({ message : "User successfully logged out" });
    console.log(req.user);
    });
}


export {
  signUpPost,
  login_controller,
  login_middleware,
  logout,
  bcrypt
}