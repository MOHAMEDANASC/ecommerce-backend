import { Router } from "express";
import authController from "../controllers/authController";
import { validate } from "../middlewares/validateMiddleware";
import { registerSchema, loginSchema } from "../validations/authValidation";

const router = Router();

router.post("/register",validate(registerSchema),authController.registerUser);
router.post("/login",validate(loginSchema),authController.loginUser);
router.post("/verify-otp", authController.verifyOTP);
router.post("/reset-password",authController.resetPassword);
router.post("/forgot-password", authController.forgotPassword);


export default router
