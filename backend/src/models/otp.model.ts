import { Schema, model } from "mongoose";

const otpSchema = new Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300}, //300 seconds - 5 minutes
});

export const otpModel = model("Otp", otpSchema);