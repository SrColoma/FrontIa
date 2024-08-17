
import express from "express";
import {handler} from "./build/handler.js";

const app = express();

app.get("/healt-check", (req, res) => {
  res.send({
    status: 200,
    message: "Server is running",
  });
});

app.use(handler);
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});