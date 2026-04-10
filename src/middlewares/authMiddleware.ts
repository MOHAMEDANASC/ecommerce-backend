import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import prisma from "../config/prisma";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const parts = authHeader.split(" ");

      if (parts.length === 2 && parts[1]) {
        token = parts[1];
      }
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });

    if (blacklisted) {
      return res.status(401).json({
        message: "Token is invalid (logged out)",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number; role?: string };

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};