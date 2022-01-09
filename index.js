const express = require("express");

const app = express();
const PORT = 3000;
const userRouter = require("./routes/user.router");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes middleware
app.use("/api/user", userRouter);

app.listen(PORT, () => console.log("Server listening on port", PORT));
