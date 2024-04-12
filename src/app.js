import Express from "express"
import gameLogicsRoute from "./routes/isFound.route.js"
import userRouter from "./routes/auth.route.js"
import cors from 'cors'
import cookieParser from "cookie-parser"
import helmet from "helmet"
import { rateLimit } from 'express-rate-limit'
import ExpressMongoSanitize from "express-mongo-sanitize"
import leaderBoardRouter from "./routes/leaderBoard.route.js"

const app = Express();


const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	message : "Too many requests from this IP, please try again in an Hour"
});


// Middleware
app.use(ExpressMongoSanitize());
app.use(limiter)
app.use(helmet());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));
app.use(cors({
    credentials : true,
    origin : 'http://localhost:5173'
}));
app.use(cookieParser()) ;



//routes
app.get("/", (req, res) => {
    res.send("Working Fine");
})
app.use("/gameLogics", gameLogicsRoute);
app.use("/auth", userRouter);
app.use("/", leaderBoardRouter);

export {app}