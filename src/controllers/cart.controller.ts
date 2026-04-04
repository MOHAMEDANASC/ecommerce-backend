import { Request, Response } from "express";
import prisma from "../config/prisma";


export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    res.status(200).json({
      message: "cart fetched successfully",
      cart,
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
};


export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        message: "ProductId and quantity are required",
      });
    }
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId : cart.id,
        productId : Number(productId),
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId : cart.id,
          productId : Number(productId),
          quantity,
        },
      });
    }

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity,
        },
      });
    }

    res.status(200).json({
      message: "Product added to cart",
      cartItem,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        message: "ProductId and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: Number(productId),
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    res.status(200).json({
      message: "Cart item quantity updated",
      updatedItem,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const removeCartItem = async (req : Request , res : Response) => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "ProductId is required",
      });
    }

    const cart = await prisma.cart.findUnique({
      where : { userId },
    });

    if(!cart) {
      return res.status(404).json({
        message : "cart not found",
      });
    };

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: Number(productId),
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found in cart",
      });
    }

    await prisma.cartItem.delete({
      where : {id : cartItem.id},
    });

    res.status(200).json({
      message : "item removed in cart",
    });

  }catch (error) {
    console.error(error);
    res.status(500).json({
      message : "internal server error",
    });
  };
}


export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemsCount = await prisma.cartItem.count({
      where: { cartId: cart.id },
    });

    if (itemsCount === 0) {
      return res.status(200).json({
        message: "Cart is already empty",
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(200).json({
      message: "Cart cleared successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};