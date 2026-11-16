import { transporter } from "../config/mail.js";

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  const mailOptions = {
    from: `"Chat App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email - Chat App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p>Use the following 6-digit code to complete your verification. This code expires in <b>5 minutes</b>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4F46E5; background: #EEF2FF; padding: 10px 24px; border-radius: 6px;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};