import { Router } from "express";
import categoryController from "../controllers/categoryController";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getSingleCategory);


export default router;