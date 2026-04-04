import { Router } from "express";

import {
    createOrder,
    getUserOrders,
    getSingleOrder,
    cancelOrder,
} from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = Router();


router.post("/",authMiddleware, createOrder);
router.get("/",authMiddleware, getUserOrders);
router.get("/:id",authMiddleware, getSingleOrder);
router.patch("/:id/cancel",authMiddleware, cancelOrder);

export default router;
