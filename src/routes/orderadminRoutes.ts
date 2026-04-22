import { Router } from "express";

import orderadminController from "../controllers/orderadminController";

import { adminAuthMiddleware, allowRoles } from "../middlewares/adminAuthMiddleware";


const router = Router();

router.put("/:id/status",adminAuthMiddleware,allowRoles("SUPER_ADMIN","SALES_MANAGER"),orderadminController.updateOrderStatus);


export default router;