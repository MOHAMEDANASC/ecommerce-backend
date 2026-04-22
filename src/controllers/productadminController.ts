import { Request, Response } from "express";
import prisma from "../config/prisma";
import cloudinary from "../config/cloudinary";


const createProduct = async (req: Request, res: Response) => {
  try {
    const admin = (req as any).user;

    // Admin check
    if (!admin || !admin.id || admin.type !== "ADMIN") {
      return res.status(401).json({ message: "Unauthorized (Admin only)" });
    }

    const { name, price, description, stock, categoryId } = req.body;

    // Validation
    if (!name || price == null || stock == null || !categoryId) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // price checking
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // Category check
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return res.status(400).json({
        message: "Invalid categoryId",
      });
    }

    // Files
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "At least one image required",
      });
    }

    // ✅ Create product (FIXED)
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        description,
        stock: Number(stock),
        categoryId: category.id,

        adminId: admin.id,

        images: {
          create: files.map((file: any) => {
            if (!file.path || !(file.public_id || file.filename)) {
              throw new Error("Invalid file upload data");
            }

            return {
              url: file.path,
              publicId: file.public_id || file.filename,
            };
          }),
        },
      },
      include: {
        images: true,
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error: any) {
    console.log("FULL ERROR:", error);

    return res.status(500).json({
      message: error.message || "Something went wrong",
    });
  }
};

const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, price, description, stock, categoryId } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        description,
        stock: stock !== undefined ? Number(stock) : undefined,
        ...(categoryId && {
          categoryId: Number(categoryId),
        }),
      },
    });

    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      await prisma.productImage.createMany({
        data: files.map((file) => ({
          url: file.path,
          publicId: file.filename,
          productId: productId,
        })),
      });
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    return res.json({
      message: "Product updated successfully",
      finalProduct,
    });

  } catch (error: any) {
    console.error("UPDATE ERROR:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.json({
      message: "Product deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE ERROR:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

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
        admin: {
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


const deleteProductImage = async (req: Request, res: Response) => {
  try {
    const imageId = Number(req.params.id);

    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    // 1. Find image
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // 2. Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // 3. Delete from DB
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return res.json({
      message: "Image deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE IMAGE ERROR:", error.message);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


export default {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  deleteProductImage
}