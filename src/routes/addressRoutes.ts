import { Router } from "express";
console.log("ADDRESS ROUTES LOADED");

import addressController from "../controllers/addressController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", addressController.addAddress);
router.get("/", authMiddleware, addressController.getAllAddress);
router.put("/:id", authMiddleware, addressController.updateAddress);

console.log("REGISTERING ROUTES:");
router.stack.forEach((r: any) => {
  if (r.route) {
    console.log(Object.keys(r.route.methods), r.route.path);
  }
});

export default router;