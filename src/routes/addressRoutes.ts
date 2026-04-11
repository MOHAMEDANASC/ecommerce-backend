import { Router } from "express";
console.log("ADDRESS ROUTES LOADED");

import addressController from "../controllers/addressController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/",authMiddleware, addressController.addAddress);
router.get("/", authMiddleware, addressController.getAllAddress);
router.put("/:id", authMiddleware, addressController.updateAddress);

export default router;