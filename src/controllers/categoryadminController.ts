import { Request, Response } from "express";
import prisma from "../config/prisma";

const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Category name is required",
      });
    }
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


const updateCategory = async (req : Request, res : Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const categoryId = Number(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        message: "Invalid category ID",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where : { id : categoryId },
    });

    if(!existingCategory){
      return res.status(404).json({
        message : "category not found"
      });
    }

    const updateCategory = await prisma.category.update({
      where : { id : categoryId },
      data : { name },
    });

    res.status(200).json({
      message : "Category updated successfully",
      updateCategory,
    });


  } catch (error : any ){
    console.error(error);
    res.status(500).json({
      message : "Internal server error",
    });
  };
};


const deleteCategory = async (req : Request , res: Response) => {
  try {
    const { id } = req.params;
    const categoryId = Number(id);

    if(isNaN(categoryId)){
      return res.status(404).json({
        message : "inavalid category ID",
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where : { id : categoryId },
    });

    if(!existingCategory){
      return res.status(404).json({
        message : "category not found"
      });
    }

    const deleteCategory = await prisma.category.delete({
      where : {id : categoryId },
    });

    res.status(200).json({
      message : "category deleted successfully",
      deleteCategory,
    })

  } catch (error : any) {
    console.error(error);
    res.status(500).json({
      message : "internal server error",
    });
  }
};


export default {
  createCategory,
  updateCategory,
  deleteCategory
}