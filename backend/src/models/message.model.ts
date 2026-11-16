import { Schema, model, Types } from "mongoose";

export interface IMessage {
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true,
        }, 
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

export const MessageModel = model<IMessage>("Message", messageSchema);