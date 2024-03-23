import mongoose, { Schema } from "mongoose";

const userStatusSchema = new Schema(
    {
        user : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        level : {
            type : Number,
        },
        charactersFound : {
            type : Array,
            required : true
        },
        isOver : {
            type : Boolean,
            required : true,
            default : false
        },
        timeOfCompletion : {
            type : Number,
            required : true
        }
    }
)


export default UserStatus = mongoose.model("UserStatus", userStatusSchema);