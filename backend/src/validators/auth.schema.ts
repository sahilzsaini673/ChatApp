// Validates incoming user data
import { email, z } from 'zod';

export const registerSchema = z.object({
    name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(80, "Name is too long"),

    email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email("Invalid email address")),

    password: z
    .string()
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password is too long"),
}).strict()

// This automatically creates a TypeScript type from the Zod schema.
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
    email: z
        .string(),

    otp: z
        .string()
        .length(6, "OTP must be exactly 6 digits")
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email("Invalid email address")),

    password: z
        .string()
        .min(1, "Password is required"),    
});

export const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
})
