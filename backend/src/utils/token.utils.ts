import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN || "access-token";
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN || "refresh-token";

const generateToken = (userId: string) => {
    
    const accessToken = jwt.sign({ userId }, ACCESS_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, {
        expiresIn: "7d",
    });
    
    return { accessToken, refreshToken };
}

const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_SECRET) as { userId: string }; 
};

const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
};

export { generateToken, verifyAccessToken, verifyRefreshToken};