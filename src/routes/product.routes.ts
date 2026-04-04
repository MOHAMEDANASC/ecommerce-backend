import { Router } from "express";
import { 
    createProduct,  
    getAllProducts, 
    getSingleProduct, 
    updateProduct,
    deleteProduct
} from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();


router.get("/", getAllProducts);
router.get("/:id",getSingleProduct); 

router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/:id",authMiddleware, isAdmin, updateProduct);
router.delete("/:id",authMiddleware, isAdmin, deleteProduct);

export default router;