import { Request, Response } from "express";
import prisma from "../config/prisma";


const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatus = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    res.json({
      message: "Order status updated",
      order: updated,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export default {
  updateOrderStatus
}