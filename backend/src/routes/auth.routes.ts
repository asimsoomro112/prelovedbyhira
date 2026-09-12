import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/sync", authRateLimiter, authController.syncUser);
router.post("/forgot-password", authRateLimiter, authController.forgotPassword);
router.post("/reset-password", authRateLimiter, authController.resetPassword);

// 🛡️ FIX H-11: Profile routes consolidated to /users/profile (user.routes.ts)
// to avoid duplicate endpoints with inconsistent validation.
// GET/PATCH profile → use /users/profile instead.

export default router;
