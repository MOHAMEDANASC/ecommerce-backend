import { Router } from "express";

import orderadminController from "../controllers/orderadminController";

import { adminAuthMiddleware, allowRoles } from "../middlewares/adminAuthMiddleware";


const router = Router();

router.put("/admin/orders/:id/status", adminAuthMiddleware, allowRoles("SALES_MANAGER"), orderadminController.updateOrderStatus);

export default router;