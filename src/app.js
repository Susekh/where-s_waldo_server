import Express from "express"
import gameLogicsRoute from "./routes/isFound.route.js"
import userRouter from "./routes/addUser.route.js"
import cors from 'cors'
import session from "express-session";
import passport from "passport";

const app = Express()

app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));
app.use(cors())
app.use(Express.json())
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());


app.get("/", (req, res) => {
    res.send("Working Fine");
})

app.use("/gameLogics", gameLogicsRoute);
app.get("/auth/sign-up", (req, res) => {
    res.json({message : "server is working fine"})
})
app.use("/auth", userRouter);

export {
    app
}