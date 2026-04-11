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


const getSingleCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category fetched successfully",
      category,
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
  getSingleCategory
}