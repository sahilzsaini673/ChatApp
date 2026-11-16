import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { UserModal } from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModal.findById(req.userId).select(
      "_id name email avatar",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const updates: { name?: string; avatar?: string } = {};

    if (name && typeof name === "string") {
      const trimmed = name.trim();

      if (trimmed.length < 2 || trimmed.length > 80) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 80 char",
        });
      }

      updates.name = trimmed;
    }

    if (avatar) {
      const formattedAvatar = avatar.trim().replace("base64, ", "base64,");
      const uploadResponse = await cloudinary.uploader.upload(formattedAvatar, {
        folder: "chat_avatars",
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      updates.avatar = uploadResponse.secure_url;
    }

    const updatedUser = await UserModal.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true },
    ).select("_id name email avatar");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Update profile error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const users = await UserModal.find({
      email: { $regex: email.trim().toLowerCase(), $options: "i" },
      _id: { $ne: req.userId },
      isVerified: true,
    })
      .select("_id name email avatar")
      .limit(10);

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Search users error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const savePushToken = async (req: AuthRequest, res: Response) => {
  const { pushToken } = req.body;

  await UserModal.findByIdAndUpdate(req.userId, {
    pushToken
  });

  return res.status(200).json({
    success: true,
    message: "Push token updated"
  })
};