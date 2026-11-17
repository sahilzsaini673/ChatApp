import { Request, Response } from "express";
import argon2 from "argon2";
import { UserModal } from "../models/user.model.js";
import crypto from "node:crypto";
import { otpModel } from "../models/otp.model.js";
import { registerSchema, verifyOtpSchema } from "../validators/auth.schema.js";
import { sendOtpEmail } from "../services/mail.service.js";
import { generateToken } from "../utils/token.utils.js";
import { loginSchema, refreshTokenSchema } from "../validators/auth.schema.js";
import { verifyRefreshToken } from "../utils/token.utils.js";

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const register = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invaild input",
        error: result.error.issues,
      });
    }

    const data = result.data;

    const existingUser = await UserModal.findOne({
      email: data.email,
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2d,
    });

    if (!existingUser) {
      await UserModal.create({
        name: data.name,
        email: data.email,
        passwordHash,
      });
    } else {
      await UserModal.updateOne(
        { email: data.email },
        { name: data.name, passwordHash },
      );
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();

    await otpModel.deleteMany({ email: data.email });
    await otpModel.create({ email: data.email, otpHash: hashOtp(rawOtp) });

    try {
      await sendOtpEmail(data.email, rawOtp);
      console.log(`OTP sent to email: ${data.email}`);
    } catch (mailError) {
      console.log("⚠️ Email failed (Render blocks SMTP). Here is your OTP:");
      console.log(`👉👉👉 OTP for ${data.email} is: ${rawOtp} 👈👈👈`);
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify the 6-digit OTP sent to your email.",
      email: data.email,
      otp: rawOtp,
    });
  } catch (error) {
    console.log("Registration successfull", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const result = verifyOtpSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Wrong data input",
        errors: result.error.issues,
      });
    }

    const { email, otp } = result.data;

    const otpRecord = await otpModel.findOne({ email, otpHash: hashOtp(otp) });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await UserModal.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await otpModel.deleteMany({ email });

    const { accessToken, refreshToken } = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: "Email verified successfully",
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("OTP verifiction error", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const reSendOTP = async (req: Request, res: Response) => {
  try {
    const result = req.body;

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data input",
        errors: result.error.issues,
      });
    }

    const { email } = result.data;
    const user = await UserModal.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();

    await otpModel.deleteMany({ email });
    await otpModel.create({ email, otpHash: hashOtp(rawOtp) });

    await sendOtpEmail(email, rawOtp);

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email.",
    });
  } catch (error) {
    console.log("Resend OTP error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid data input",
        errors: result.error.issues,
      });
    }

    const { email, password } = result.data;

    const user = await UserModal.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email with OTP before logging in",
        isVerified: false,
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      console.log("Invalid Password");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const { accessToken, refreshToken } = generateToken(user._id.toString());
    console.log("Login Done!");
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      tokens: { accessToken, refreshToken },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const result = refreshTokenSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        messsage: "Invalid data input",
        errors: result.error.issues,
      });
    }

    const { refreshToken } = result.data;

    let payload: { userId: string };

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again",
      });
    }

    const user = await UserModal.findById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const tokens = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      tokens,
    });
  } catch (error) {
    console.log("Refresh token error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const forgetPassword = async (req: Request, res: Response) => {
  try {
    const result = req.body;
    console.log(req.body);

    // const { email } = result.data;
    // console.log(email)

    const user = await UserModal.findOne({ email: result.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found, Please login",
      });
    }

    const rawOtp = crypto.randomInt(100000, 999999).toString();

    await sendOtpEmail(result.email, rawOtp);

    await otpModel.deleteMany({ email: result.email });

    await otpModel.create({ email: result.email, otpHash: hashOtp(rawOtp) });
  
    return res.status(201).json({
      success: true,
      message: "OTP sent to your email.",
      email: result.email,
    });
  } catch (error) {
    console.log("Registration successfull", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const newPassword = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const existingUser = await UserModal.findOne({
      email: data.email,
    });

    const passwordHash = await argon2.hash(data.password, {
      type: argon2.argon2d,
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    } else {
      await UserModal.updateOne(
        { email: data.email },
        { passwordHash },
      );
    };

    console.log("new password Done!");

    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.log("new Password error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  register,
  verifyOtp,
  reSendOTP,
  login,
  refreshAccessToken,
  forgetPassword,
  newPassword,
};
