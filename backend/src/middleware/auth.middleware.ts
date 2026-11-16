import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.utils.js";

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token as string);
        req.userId = payload.userId;
        next();
    } catch (error) {
        return res.status(401).json({
            success: true,
            message: "Invalid or expired token"
        })
    }
};