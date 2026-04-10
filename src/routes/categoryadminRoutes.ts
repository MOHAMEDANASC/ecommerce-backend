import { Router } from "express";
import deleteCategory from "../controllers/categoryadminController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";

const router = Router();


router.post("/",authMiddleware, isAdmin, deleteCategory.createCategory);
router.put("/:id",authMiddleware, isAdmin, deleteCategory.updateCategory);
router.delete("/:id",authMiddleware, isAdmin, deleteCategory.deleteCategory);

export default router;