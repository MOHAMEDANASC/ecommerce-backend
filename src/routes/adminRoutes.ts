import express from "express";
import adminController from "../controllers/adminController";
import authController from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/adminMiddleware";

const router = express.Router();


router.post("/create", (req, res, next) => {
  console.log("➡️ HIT: POST /api/admin/create");
  next();
}, authController.createAdmin);

router.post("/login", (req, res, next) => {
  console.log("➡️ HIT: POST /api/admin/login");
  next();
}, authController.adminLogin);




router.get("/users", authMiddleware, isAdmin, adminController.getAllUsers);

router.get("/users/:id", authMiddleware, isAdmin, adminController.getSingleUser);

router.put("/users/:id", authMiddleware, isAdmin, adminController.updateUser);

router.delete("/users/:id", authMiddleware, isAdmin, adminController.deleteUser);

router.get("/dashboard", authMiddleware, isAdmin, adminController.getDashboardStats);


export default router;