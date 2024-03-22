import mongoose, { Schema } from "mongoose";

const winnerSchema = new Schema(
    {
        user : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        timeOfCompletion : {
            type : Number,
            required : true
        }
    }
)


export default Winner = mongoose.model("Winner", winnerSchema);