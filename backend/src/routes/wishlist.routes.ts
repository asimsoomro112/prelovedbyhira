import { Router } from "express";
import * as wishlistController from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/toggle", wishlistController.toggleWishlist);
router.get("/", wishlistController.getWishlist);
router.get("/check/:productId", wishlistController.checkWishlist);

export default router;
