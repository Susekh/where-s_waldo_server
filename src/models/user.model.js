import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
})

export default User = mongoose.model("User", userSchema);