import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { 
    getOrCreateChat,
    getUserChats,
    getChatMessages
} from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/", authenticate, getOrCreateChat);
chatRouter.get("/", authenticate, getUserChats);
chatRouter.get("/:chatId/messages", authenticate, getChatMessages);