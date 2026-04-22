import { Request, Response } from "express";
import prisma from "../config/prisma";


const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      skip,
      take: limit,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count();

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });

  } catch (error: any) {
    console.error("GET PRODUCTS ERROR:", error.message);

    return res.status(500).json({
      message: "Something is wrong",
    });
  }
};


const getSingleProduct = async (req : Request, res : Response) => {
    try {

        const { id } = req.params;

        const product  = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
            category: true,
            user: {
                select: {
                id: true,
                name: true,
                email: true
                }
            }
            },
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message : "product fetched successfully ",
            product ,
        });
        
    } catch (error : any ){
        console.error("Get Sinle Product Error", error.message);

        return res.status(500).json({
            message : "something is wrong"
        });
    };
};


export default {
    getAllProducts,
    getSingleProduct
}