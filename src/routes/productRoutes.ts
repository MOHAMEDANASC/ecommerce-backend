import { Router } from "express";

import productController from "../controllers/productController";

const router = Router();

router.get("/", productController.getAllProducts);
router.get("/:id",productController.getSingleProduct); 


export default router;