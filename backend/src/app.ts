import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/errorHandler";
import { globalRateLimiter } from "./middleware/rateLimiter";
import adminRoutes from "./routes/admin.routes";
import aiRoutes from "./routes/ai.routes";
// Route imports
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import chatRoutes from "./routes/chat.routes";
import disputeRoutes from "./routes/dispute.routes";
import notificationRoutes from "./routes/notification.routes";
import orderRoutes from "./routes/order.routes";
import payoutRoutes from "./routes/payout.routes";
import productRoutes from "./routes/product.routes";
import promotionRoutes from "./routes/promotion.routes";
import reviewRoutes from "./routes/review.routes";
import sellerRoutes from "./routes/seller.routes";
import uploadRoutes from "./routes/upload.routes";
import userRoutes from "./routes/user.routes";
import wishlistRoutes from "./routes/wishlist.routes";

const app = express();

// ─── Middleware ────────────────────────────
app.use(helmet());
app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:3001",
			"http://192.168.100.72:3000",
			"http://192.168.100.72:3001",
			process.env.FRONTEND_URL || "http://localhost:3000",
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ──────────────────────────
app.use("/api/", globalRateLimiter);

// ─── Health Check ───────────────────────────
app.get("/api", (_req, res) => {
	res.json({
		status: "online",
		message: "Welcome to the ReVault Neural API (2026)",
		version: "2.0.0-neural",
		documentation: "/api/health",
	});
});

app.get("/api/health", (_req, res) => {
	res.json({
		status: "ok",
		name: "ReVault API",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	});
});

// ─── API Routes ─────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/chat", chatRoutes);

// ─── 404 Handler ────────────────────────────
app.use((_req, res) => {
	res.status(404).json({ error: "Route not found" });
});

// ─── Error Handler ──────────────────────────
app.use(errorHandler);

export default app;
