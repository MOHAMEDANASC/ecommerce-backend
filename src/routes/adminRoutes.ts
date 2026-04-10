import express from "express";
import adminController from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";


const router = express.Router();

router.get("/users", authMiddleware, isAdmin, adminController.getAllUsers);
router.get("/users/:id", authMiddleware, isAdmin, adminController.getSingleUser);
router.put("/users/:id", authMiddleware, isAdmin, adminController.updateUser);
router.delete("/users/:id", authMiddleware, isAdmin, adminController.deleteUser);
router.get("/dashboard", authMiddleware, isAdmin, adminController.getDashboardStats);

export default router;