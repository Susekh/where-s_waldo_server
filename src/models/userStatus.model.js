import mongoose, { Schema } from "mongoose";

const userStatusSchema = new Schema(
    {
        user : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        level : {
            type : Number
        },
        charactersFound : {
            type : Array
        },
        isOver : {
            type : Boolean,
            required : true,
            default : false
        },
        timeOfCompletion : {
            type : Number,
            default : 0
        },
        prevScore : {
            type : Number
        }
    }
)

const UserStatus = mongoose.model("UserStatus", userStatusSchema);
export default UserStatus