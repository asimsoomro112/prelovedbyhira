import { Router } from "express";
import {
	addToCart,
	clearCart,
	getCart,
	removeFromCart,
	updateCartItem,
} from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item/:itemId", updateCartItem);
router.delete("/item/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
