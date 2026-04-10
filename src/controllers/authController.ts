import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { registerSchema } from "../validations/authValidation";
import { loginSchema } from "../validations/authValidation";
import { ZodError } from "zod";
import { sendOTPEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";



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
       console.error(error);
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "validation failed 1",
                errors: error.issues,
            });
        }

        return res.status(500).json({
            message: "something went wrong",
        });
    }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry,
        otpVerified: false,
      },
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (mailError) {
      console.log("EMAIL ERROR:", mailError);

      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    return res.status(200).json({
      message: "OTP sent to your email",
    });

  } catch (error: any) {
    console.log("ERROR:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "validation failed 2",
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
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
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
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.log(error);
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

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

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
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
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
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (!user.forgotOtpExpiry || user.forgotOtpExpiry < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    return res.status(200).json({
      message: "OTP verified",
    });

  } catch (error) {
    console.error(error);
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

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


export default {
  registerUser,
  loginUser,
  verifyOTP,
  logoutUser,
  forgotPassword,
  verifyForgotOTP,
  resetPassword
}