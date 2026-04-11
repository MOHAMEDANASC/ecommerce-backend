import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "../validations/authValidation";
import { ZodError } from "zod";
import { sendOTPEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";


const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await prisma.admin.findFirst();

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        type: "ADMIN",   
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};



const registerUser = async (req: Request, res: Response) => {
  try {
    const parsedData = registerSchema.parse(req.body);
    const { name, email, password, phone } = parsedData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔥 OTP:", otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
        otpVerified: false,
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
        otpVerified: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        type: "USER",  
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({
        message: "No token provided",
      });
    }

    await prisma.blacklistedToken.create({
      data: { token },
    });

    res.clearCookie("token");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};



const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        message: "If email exists, OTP sent",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔥 FORGOT OTP:", otp);
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        forgotOtp: otp,
        forgotOtpExpiry: expiry,
      },
    });

    await sendOTPEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent",
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const verifyForgotOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.forgotOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.forgotOtpExpiry || user.forgotOtpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    return res.status(200).json({
      message: "OTP verified",
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        forgotOtp: null,
        forgotOtpExpiry: null,
      },
    });

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export default {
  createAdmin,
  adminLogin,
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
};