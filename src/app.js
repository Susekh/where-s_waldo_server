import Express from "express"
import gameLogicsRoute from "./routes/gamelogics.route.js"
import userRouter from "./routes/auth.route.js"
import cors from 'cors'
import cookieParser from "cookie-parser"
import helmet from "helmet"
import ExpressMongoSanitize from "express-mongo-sanitize"
import leaderBoardRouter from "./routes/leaderBoard.route.js"
import dotenv from 'dotenv';


const app = Express();






dotenv.config();

// Middlewares
app.use(ExpressMongoSanitize());
app.use(helmet());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));
app.use(cors({
    credentials : true,
    origin : `${process.env.CORS_ORIGIN}`
}));
app.use(cookieParser());



//routes
app.get("/test", (req, res) => {res.send("Hello world!")})
app.use("/gameLogics", gameLogicsRoute);
app.use("/auth", userRouter);
app.use("/", leaderBoardRouter);

export {app}