import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'
import asyncHandler from "./utils/asyncHandler.js";
dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
})
.catch(asyncHandler(async() => {
        console.log("MONGO db connection failed !!! ", err);
}))