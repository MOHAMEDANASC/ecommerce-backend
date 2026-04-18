import { Request, Response } from "express";
import prisma from "../config/prisma";


const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId, productId, quantity = 1 } = req.body; // Added productId & quantity

    if (!addressId) {
      return res.status(400).json({ message: "Address is required" });
    }

    // Validate address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return res.status(400).json({ message: "Invalid address" });
    }

    let orderItems: any[] = [];
    let total = 0;

    // Case 1: Direct Buy (Single Product - Buy Now)
    if (productId) {
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Only ${product.stock} left.`,
        });
      }

      orderItems = [
        {
          productId: product.id,
          quantity: Number(quantity),
          price: product.price,
        },
      ];

      total = product.price * Number(quantity);
    } 
    // Case 2: Buy from Cart
    else {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for ${item.product.name}`,
          });
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        });

        total += item.product.price * item.quantity;
      }
    }

    // Create Order with Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          total,
          status: "PENDING",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      // If it was from cart → clear the cart items
      if (!productId) {
        await tx.cartItem.deleteMany({
          where: { cartId: (await tx.cart.findUnique({ where: { userId } }))?.id },
        });
      }

      // Decrease stock for all items in the order
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      return newOrder;
    });

    return res.status(201).json({
      message: productId 
        ? "Order created successfully for Buy" 
        : "Order created successfully from cart",
      order,
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const getSingleOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, 
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};


const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orderId = Number(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, 
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!["PENDING", "PAID"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    await prisma.$transaction(async (tx) => {

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

    });

    return res.status(200).json({
      message: "Order cancelled successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};



export default {
  createOrder,
  getUserOrders,
  getSingleOrder,
  cancelOrder
}