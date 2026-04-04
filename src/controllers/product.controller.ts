import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", (req as any).user);
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({
        message: "Unauthorized: User not found",
      });
    }

    const userId = user.id;
    const { name, price, description, stock, categoryId } = req.body;
    if (!name || price == null || stock == null || !categoryId) {
      return res.status(400).json({
        message: "Name, price, stock and categoryId are required",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    console.log("CATEGORY:", category);

    if (!category) {
      return res.status(400).json({
        message: "Invalid categoryId: Category does not exist",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        description,
        stock: Number(stock),

        category: {
          connect: { id: category.id },
        },

        user: {
          connect: { id: userId },
        },
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message, 
    });
  }
};


export const getAllProducts = async (req : Request , res : Response)=> {
    try {
        const product = await prisma.product.findMany({
            include : {
                category : true,
                user : true,
            },
        });

        return res.status(200).json({
            message : "Products fetched successfully",
            product,
        });


    } catch (error : any) {
        console.error("GET PRODUCTS ERROR:",error.message);

        return res.status(500).json({
            message : "something is wrong"
        });

    };
};

export const getSingleProduct = async (req : Request, res : Response) => {
    try {

        const { id } = req.params;

        const product  = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                user: true,
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

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock, categoryId } = req.body;

    const productId = Number(id);

    // ✅ Validate ID
    if (isNaN(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    // ✅ Check product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // ✅ If categoryId provided → validate it
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(categoryId) },
      });

      if (!category) {
        return res.status(400).json({
          message: "Invalid categoryId",
        });
      }
    }

    // ✅ Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        description,
        stock: stock !== undefined ? Number(stock) : undefined,

        // update category only if provided
        ...(categoryId && {
          category: {
            connect: { id: Number(categoryId) },
          },
        }),
      },
      include: {
        category: true,
        user: true,
      },
    });

    return res.status(200).json({
      message: "Product updated successfully",
      updatedProduct,
    });

  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


//delete product 
export const deleteProduct = async (req : Request , res : Response) => {
    try {

        const { id } = req.params;
        const productId = Number(id);


        if (isNaN(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
        });


        if (!existingProduct) {
        return res.status(404).json({
            message: "Product not found",
        });
        }


     const deletedProduct = await prisma.product.delete({
        where: { id: productId },
     });

        return res.status(200).json({
            message: "Product deleted successfully",
            deletedProduct,
        });


    } catch (error : any ){
        console.error("UPDATE PRODUCT ERROR:", error.message);

      return res.status(500).json({
      message: "Something went wrong",
    });
    }
}