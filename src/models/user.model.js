import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    isGameOver : {
        type : Boolean,
        required : true,
        default : false
    }
})

export default User = mongoose.model("User", userSchema);