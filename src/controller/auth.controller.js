import asyncHandler from "../utils/asyncHandler";
import { validationResult } from "express-validator";
import bcrypt from 'bcryptjs'
import userModel from "../models/user.model";
import passport from "../middleware/passport/passport";



const signUpPost = asyncHandler(
    
    async (req, res) => {
      const errors = validationResult(req);
      if(errors.isEmpty()){
        try {
          const { username, password } = req.body;
           // Check if username already exists
           const existingUser = await User.findOne({ username });
           if (existingUser) {
             return res.status(400).json({ message: "Username already exists" });
           }
      
          bcrypt.hash(password, 10, async(err, hashedPassword) => {
            if(err){
              throw err;
            } else {
              const memCode = generateMemberString();
               const user = new userModel({
                  username : username,
                  password: hashedPassword,
                  member : false,
                  admin : true,
                  memberCode : memCode
              });
              await user.save();
            }
          });
      
          res.status(201).json({ message : "User created Succesfully" });
        } catch(err) {
          res.status(500).json({ message: "Server error" });
        }
      } else {
        res.render("errPage", { errors : errors.array() , user : req.user});
      }
    }
  
)



//login part

const login_middleware = passport.authenticate("local")
const login_controller = (req , res) => {
 if(req){
    res.status(201).json({ message : "login successful" })
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
    });
}