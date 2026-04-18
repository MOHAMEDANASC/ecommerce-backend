import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import prisma from "../config/prisma";


interface AuthRequest extends Request {
  user?: {
    id: number;
    type: "ADMIN";
    role: string;
  };
}


export const adminAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // ✅ Get token from header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // ✅ Optional: cookie fallback
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // ✅ Check blacklist
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token },
    });

    if (blacklisted) {
      return res.status(401).json({
        message: "Token is invalid (logged out)",
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: number; type: "ADMIN" };

    if (decoded.type !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    // ✅ Get admin from DB
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    // ✅ Attach user
    req.user = {
      id: admin.id,
      type: "ADMIN",
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};


export const allowRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};