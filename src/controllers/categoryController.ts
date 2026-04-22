import { Request, Response } from "express";
import prisma from "../config/prisma";


const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};



export default {
  getAllCategories,
}