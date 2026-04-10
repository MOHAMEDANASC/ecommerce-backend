import { Router } from "express";
import authController from "../controllers/authController";
import { validate } from "../middlewares/validateMiddleware";
import { registerSchema, loginSchema } from "../validations/authValidation";
import { upload } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/register",validate(registerSchema),authController.registerUser);
router.post("/login",validate(loginSchema),authController.loginUser);
router.post("/verify-otp", authController.verifyOTP);
router.post("/verify-forgot-otp",authController.verifyForgotOTP);
router.post("/reset-passowrd",authController.resetPassword);
upload.single("images");

export default router
