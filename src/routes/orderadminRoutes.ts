import { Router } from "express";

import orderadminController from "../controllers/orderadminController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";



const router = Router();


router.put("/admin/orders/:id/status", authMiddleware, isAdmin, orderadminController.updateOrderStatus);


export default router;
