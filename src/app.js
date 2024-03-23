import Express from "express"
import gameLogicsRoute from "./routes/isFound.route.js"

const app = Express()

app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));


app.get("/", (req, res) => {
    res.send("Working Fine");
})

app.use("gameLogics", gameLogicsRoute);

export {
    app
}