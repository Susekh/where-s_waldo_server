import Express from "express"

const app = Express()

app.use(Express.urlencoded({ extended: false }));
app.use(Express.static('public'));


app.get("/", (req, res) => {
    res.send("Working Fine");
})

export {
    app
}