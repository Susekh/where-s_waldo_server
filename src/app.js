import Express from "express"

const app = Express()

app.get("/", (req, res) => {
    res.send("Working Fine");
})

export {
    app
}