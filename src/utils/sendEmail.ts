import nodemailer from "nodemailer";

export const sendOTPEmail = async (email: string, otp: string) => {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    console.log("EMAIL_USER:", process.env.EMAIL_USER);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${otp}`,
    });
    console.log("EMAIL_USER:", process.env.EMAIL_USER);

};