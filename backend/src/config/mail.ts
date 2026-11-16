import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

const verifyMailConnection = async () => {
    try{
        await transporter.verify();
        console.log("Mail service connected successfully");
    } catch (error) {
        console.log("Mail service failed", error);
    }
}

export { transporter, verifyMailConnection };