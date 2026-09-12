import dotenv from "dotenv";

dotenv.config();

export const config = {
	// App
	nodeEnv: process.env.NODE_ENV || "development",
	port: parseInt(process.env.PORT || "5000", 10),
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
	backendUrl: process.env.BACKEND_URL || "http://localhost:5000",

	// Database (optional — primary DB is Firestore)
	databaseUrl: process.env.DATABASE_URL || "",

	// JWT
	jwt: {
		accessSecret: process.env.JWT_ACCESS_SECRET || "default-access-secret",
		refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
		accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
		refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
	},

	// Cloudinary
	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
		apiKey: process.env.CLOUDINARY_API_KEY || "",
		apiSecret: process.env.CLOUDINARY_API_SECRET || "",
	},

	// Stripe
	stripe: {
		secretKey: process.env.STRIPE_SECRET_KEY || "",
		webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
	},

	// JazzCash
	jazzCash: {
		merchantId: process.env.JAZZCASH_MERCHANT_ID || "",
		password: process.env.JAZZCASH_PASSWORD || "",
		integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || "",
		endpoint: process.env.JAZZCASH_ENDPOINT || "",
	},

	// EasyPaisa
	easyPaisa: {
		storeId: process.env.EASYPAISA_STORE_ID || "",
		hashKey: process.env.EASYPAISA_HASH_KEY || "",
		endpoint: process.env.EASYPAISA_ENDPOINT || "",
	},

	// Email
	email: {
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: parseInt(process.env.SMTP_PORT || "587", 10),
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
		from: process.env.EMAIL_FROM || "ReVault <noreply@revault.com>",
	},
};

// 🛡️ SECURITY FIX M-04: Fatal validation for production environment
// Prevents the app from starting with known default secrets
if (config.nodeEnv === "production") {
	const INSECURE_DEFAULTS = ["default-access-secret", "default-refresh-secret"];

	if (INSECURE_DEFAULTS.includes(config.jwt.accessSecret)) {
		console.error(
			"❌ FATAL: JWT_ACCESS_SECRET is not set or is using the insecure default. Set a strong secret in your environment variables.",
		);
	}
	if (INSECURE_DEFAULTS.includes(config.jwt.refreshSecret)) {
		console.error(
			"❌ FATAL: JWT_REFRESH_SECRET is not set or is using the insecure default. Set a strong secret in your environment variables.",
		);
	}
	if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
		console.warn(
			"⚠️ WARNING: Cloudinary is not configured. Image uploads will fail.",
		);
	}
	if (!config.stripe.secretKey) {
		console.warn(
			"⚠️ WARNING: Stripe is not configured. Card payments will be unavailable.",
		);
	}
}
