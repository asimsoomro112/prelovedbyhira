import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.get("/dashboard", userController.getDashboardStats);
router.put("/profile", upload.single("avatar"), userController.updateProfile);
router.patch("/profile", upload.single("avatar"), userController.updateProfile);
router.delete("/account", userController.deleteAccount);

export default router;
