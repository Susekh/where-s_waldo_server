import Express from "express"
import gameLogicsRoute from "./routes/isFound.route.js"
import userRouter from "./routes/addUser.route.js"
import cors from 'cors'
import cookieParser from "cookie-parser"

const app = Express()



// Middleware
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));
app.use(cors({
    credentials : true,
    origin : 'http://localhost:5173'
}));
app.use(cookieParser())


app.get("/", (req, res) => {
    res.send("Working Fine");
})
app.use("/gameLogics", gameLogicsRoute);
app.use("/auth", userRouter);

export {app}