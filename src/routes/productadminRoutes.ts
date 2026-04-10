import { Router } from "express";
import productadminController from "../controllers/productadminController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";
import { upload } from "../middlewares/uploadMiddleware"; 

const router = Router();


router.post("/",authMiddleware,isAdmin,upload.array("images", 5),productadminController.createProduct);
router.put("/:id",authMiddleware,isAdmin,upload.array("images", 5),productadminController.updateProduct);
router.delete("/:id",authMiddleware,isAdmin,productadminController.deleteProduct);

export default router;