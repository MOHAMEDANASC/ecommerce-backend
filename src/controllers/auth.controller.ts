import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { registerSchema } from "../validations/auth.validation";
import { loginSchema } from "../validations/auth.validation";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";


export const registerUser = async (req: Request, res: Response) => {
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
                message: "validation failed",
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

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });

    } catch (error: any) {
        console.log("ERROR ", error);
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "validation failed",
                errors: error.issues,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};


export const logoutUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

   await prisma.blacklistedToken.create({
      data: { token },
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate input
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 2️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3️⃣ Always return same response (security)
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // 4️⃣ Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 5️⃣ Hash token before saving (VERY IMPORTANT)
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // 6️⃣ Set expiry (15 minutes)
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // 7️⃣ Save in DB
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // 8️⃣ Create reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // ⚠️ TEMP: log instead of sending email
    console.log("Reset Link:", resetLink);

    // 9️⃣ Response
    res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};