import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { searchUsers, getMyProfile, updateProfile, savePushToken } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.get("/me", authenticate, getMyProfile);
userRouter.patch("/profile", authenticate, updateProfile);
userRouter.get("/search", authenticate, searchUsers);
userRouter.post("/push-token", authenticate, savePushToken);