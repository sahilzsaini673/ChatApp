import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { chatRouter } from "./routes/chat.routes.js";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/v1/", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);

export default app;