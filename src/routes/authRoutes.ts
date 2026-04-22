import { Router } from "express";
import authController from "../controllers/authController";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);

export default router;