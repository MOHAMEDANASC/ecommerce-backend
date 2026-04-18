import { Router } from "express";

import addressController from "../controllers/addressController";
import { userAuthMiddleware } from "../middlewares/userAuthMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { addressSchema } from "../validations/addressValidator";


const router = Router();

router.post("/",userAuthMiddleware, validate(addressSchema), addressController.addAddress);
router.put("/:id", userAuthMiddleware, validate(addressSchema), addressController.updateAddress);
router.get("/", userAuthMiddleware,  addressController.getAllAddress);


export default router;