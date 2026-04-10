import { Request, Response } from "express";
import prisma from "../config/prisma";


const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({
        message: "Address is required",
      });
    }

    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!address) {
      return res.status(400).json({
        message: "Invalid address",
      });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("CREATE ORDER HIT 1");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    let total = 0;

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`,
        });
      }

      total += item.product.price * item.quantity;
    }

    console.log("CREATE ORDER HIT 2");

   
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId, 
          total,
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: true,
          address: true, 
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return newOrder; 
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
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