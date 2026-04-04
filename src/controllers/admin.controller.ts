import { Request, Response } from "express";
import prisma from "../config/prisma";


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: true,
        orders: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { name, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // 🔥 Run queries in parallel (performance)
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueData,
      recentOrders,
      orderStatusStats
    ] = await Promise.all([

      // 1️⃣ Total users
      prisma.user.count(),

      // 2️⃣ Total products
      prisma.product.count(),

      // 3️⃣ Total orders
      prisma.order.count(),

      // 4️⃣ Total revenue (only delivered orders)
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: "DELIVERED",
        },
      }),

      // 5️⃣ Recent orders (last 5)
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      }),

      // 6️⃣ Order status breakdown
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    res.status(200).json({
      message: "Dashboard data fetched successfully",

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData._sum.total || 0,
      },

      recentOrders,

      orderStatusStats,
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
};