import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = (req as any).user;

    if (!userData) {
      return res.status(401).json({
        message: "Unauthorized - user not found",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin only",
      });
    }

    next();
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};