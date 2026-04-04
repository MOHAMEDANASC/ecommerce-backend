import { Router } from "express";
import {
    createCategory , 
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getSingleCategory);

router.post("/",authMiddleware, isAdmin, createCategory);
router.put("/:id",authMiddleware, isAdmin, updateCategory);
router.delete("/:id",authMiddleware, isAdmin, deleteCategory);

export default router;