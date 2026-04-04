import { Router } from "express";
import {
     getCart,
     addToCart,
     updateCartItemQuantity,
     removeCartItem,
     clearCart
} from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = Router();

router.get("/",authMiddleware, getCart);
router.post("/",authMiddleware, addToCart);
router.put("/:productId",authMiddleware, updateCartItemQuantity);
router.delete("/:productId",authMiddleware, removeCartItem);
router.delete("/",authMiddleware, clearCart);

export default router;