import { Router } from "express";
import { 
    addAddress,
    getAllAddress, 
    updateAddress,
} from "../controllers/address.controller";

const router = Router();

router.post("/address",addAddress);
router.get("/address",getAllAddress);
router.put("/address/:id",updateAddress);


export default router;