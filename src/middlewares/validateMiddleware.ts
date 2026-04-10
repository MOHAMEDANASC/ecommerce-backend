import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req.body);

      req.body = parsedData;

      if (process.env.NODE_ENV === "development") {
        console.log("Validated BODY:", req.body);
      }

      console.log(" VALIDATE MIDDLEWARE RUNNING");

      next();
    } catch (error: any) {
    console.log("VALIDATION ERROR:", error);

    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors?.map((err: any) => ({
        field: err.path.join("."), 
        message: err.message,
      })),
    });
  }
};