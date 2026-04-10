import { Router } from "express";

import orderController from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, orderController.createOrder);
router.get("/",authMiddleware, orderController.getUserOrders);
router.get("/:id",authMiddleware, orderController.getSingleOrder);
router.patch("/:id/cancel",authMiddleware, orderController.cancelOrder);

export default router;
