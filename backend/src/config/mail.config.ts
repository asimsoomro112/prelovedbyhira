import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SMTP_USER || "dummy@gmail.com",
		pass: process.env.SMTP_PASS || "dummy", // Use App Password for Gmail
	},
});

if (!process.env.SMTP_USER) {
	console.warn("⚠️ SMTP_USER is not set. Emails will be logged to console instead of sent.");
	// @ts-ignore
	transporter.sendMail = async (mailOptions: any) => {
		console.log(`📧 [MOCK EMAIL] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
		return { messageId: "mock-id" };
	};
}

transporter.verify((error, _success) => {
	if (error && process.env.SMTP_USER) {
		console.error("❌ Mail Server Error:", error);
	} else if (process.env.SMTP_USER) {
		console.log("🚀 Mail Server is ready to secure ReVault Vault");
	}
});
