import express from "express";

import userController from "../controllers/userController";

import { authMiddleware } from "../middlewares/authMiddleware";

const router =express.Router();

router.get("/profile",authMiddleware, userController.getUserProfile);
router.put("/profile",authMiddleware, userController.updateUserProfile);

export default router

