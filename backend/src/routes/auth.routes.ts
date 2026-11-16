import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { 
    register, 
    reSendOTP, 
    verifyOtp,
    login,
    refreshAccessToken,
    forgetPassword,
    newPassword } from "../controllers/auth.controller.js";

export const authRouter = Router();

const authLimiter = rateLimit({
    windowMs: 1000 * 60 * 15,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

authRouter.post("/register", authLimiter, register);
authRouter.post("/verify-otp", authLimiter, verifyOtp);
authRouter.post("/resend-otp", authLimiter, reSendOTP);
authRouter.post("/login", authLimiter, login);
authRouter.post("/refresh-token", refreshAccessToken);
authRouter.post("/forget-password", authLimiter, forgetPassword);
authRouter.post("/new-password", authLimiter, newPassword);