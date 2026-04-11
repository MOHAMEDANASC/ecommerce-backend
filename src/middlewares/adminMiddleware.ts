import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 🔥 NEW CHECK (based on JWT)
    if (user.type !== "ADMIN") {
      return res.status(403).json({
        message: "Admins only",
      });
    }

    next();
  } catch {
    return res.status(500).json({
      message: "Server error",
    });
  }
};