import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller";


const router =express.Router();

router.get("/profile",getUserProfile);
router.put("/profile",updateUserProfile);

export default router

