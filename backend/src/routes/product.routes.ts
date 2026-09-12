import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// ─── Public Routes ──────────────────────────
router.get("/", productController.getProducts);
router.get("/bulk", productController.getProductsBulk);
router.post(
	"/visual-search",
	upload.single("image"),
	productController.visualSearch,
);
router.get("/:id", productController.getProductDetail);

// ─── Seller Routes ──────────────────────────
router.post(
	"/",
	authenticate,
	authorize("SELLER", "ADMIN"),
	upload.fields([
		{ name: "images", maxCount: 8 },
		{ name: "video", maxCount: 1 },
	]),
	productController.createProduct,
);

router.put(
	"/:id",
	authenticate,
	authorize("SELLER", "ADMIN"),
	productController.updateProduct,
);

router.delete(
	"/:id",
	authenticate,
	authorize("SELLER", "ADMIN"),
	productController.softDeleteProduct,
);

// ─── Admin Routes ───────────────────────────
router.put(
	"/admin/:id/approve",
	authenticate,
	authorize("ADMIN"),
	productController.adminApproveProduct,
);

router.put(
	"/admin/:id/reject",
	authenticate,
	authorize("ADMIN"),
	productController.adminRejectProduct,
);

export default router;
