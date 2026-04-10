import { Router } from "express";
import cartController from "../controllers/cartController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = Router();

router.get("/",authMiddleware, cartController.getCart);
router.post("/",authMiddleware, cartController.addToCart);
router.put("/:productId",authMiddleware, cartController.updateCartItemQuantity);
router.delete("/:productId",authMiddleware, cartController.removeCartItem);
router.delete("/",authMiddleware, cartController.clearCart);

export default router;