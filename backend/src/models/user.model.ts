import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, minLength: 2, maxLength: 80 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxLength: 254 },
        // select: fasle - Excludes the field from normal query results
        passwordHash: { type: String, required: true, select: false },
        // Add isVerified field to userSchema
        isVerified: { type: Boolean, default: false },
        avatar: { type: String, default: null },
        pushToken: { type: String, default: null },
    },
    {
        timestamps: true
    }
);

// To generate a TypeScript type from our schema
export type User = InferSchemaType<typeof userSchema>;
// This creates a Mongoose model named User.
export const UserModal = model("User", userSchema);
