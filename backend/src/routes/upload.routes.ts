import { Router } from "express";
import {
	deleteSingle,
	uploadMultiple,
	uploadSingle,
} from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();
router.use(authenticate);
router.post("/single", upload.single("image"), uploadSingle);
router.post("/multiple", upload.array("images", 10), uploadMultiple);
router.delete("/", deleteSingle);

export default router;
