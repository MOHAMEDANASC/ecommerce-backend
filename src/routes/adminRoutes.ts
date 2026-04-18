import express from "express";
import adminController from "../controllers/adminController";
import authController from "../controllers/authController";
import { adminAuthMiddleware, allowRoles } from "../middlewares/adminAuthMiddleware";

const router = express.Router();

// Public Route
router.post("/login", authController.adminLogin);


router.get(
  "/users",
  adminAuthMiddleware,
  allowRoles("SUPER_ADMIN"),
  adminController.getAllUsers
);

router.get(
  "/users/:id",
  adminAuthMiddleware,
  allowRoles("SUPER_ADMIN"),
  adminController.getSingleUser
);

router.put(
  "/users/:id",
  adminAuthMiddleware,
  allowRoles("SUPER_ADMIN"),
  adminController.updateUser
);

router.delete(
  "/users/:id",
  adminAuthMiddleware,
  allowRoles("SUPER_ADMIN"),
  adminController.deleteUser
);

router.get(
  "/dashboard",
  adminAuthMiddleware,
  allowRoles("SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_MANAGER"),
  adminController.getDashboardStats
);

export default router;