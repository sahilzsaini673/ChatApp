import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { ChatModel } from "../models/chat.model.js";
import { MessageModel } from "../models/message.model.js";

export const getOrCreateChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.userId;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: "Participant ID is required",
      });
    }

    let chat = await ChatModel.findOne({
      participants: { $all: [currentUserId, participantId] },
    })
      .populate("participants", "_id name email")
      .populate("lastMessage");

    if (!chat) {
      chat = await ChatModel.create({
        participants: [currentUserId, participantId],
      });
      chat = await chat.populate("participants", "_id name email avatar");
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    console.log("getOrCreateChat error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getUserChats = async (req: AuthRequest, res: Response) => {
  try {
    const chats = await ChatModel.find({ participants: req.userId })
      .populate("participants", "_id name email avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.log("getUserChats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId } = req.params;

    const messages = await MessageModel.find({ chatId })
      .populate("sender", "_id name email")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log("getChatMessages error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
