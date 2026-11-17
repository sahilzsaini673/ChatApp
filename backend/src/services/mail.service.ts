import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  const { data, error } = await resend.emails.send({
    from: "Chat App <onboarding@resend.dev>",
    to: [toEmail],
    subject: "Verify your email - Chat App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p>Use the following 6-digit code to complete your verification:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4F46E5; background: #EEF2FF; padding: 10px 24px; border-radius: 6px;">
            ${otp}
          </span>
        </div>
        <p style="color: #666; font-size: 13px;">This code expires in 5 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  return data;
};