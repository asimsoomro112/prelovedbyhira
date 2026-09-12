import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS, // Use App Password for Gmail
	},
});

transporter.verify((error, _success) => {
	if (error) {
		console.error("❌ Mail Server Error:", error);
	} else {
		console.log("🚀 Mail Server is ready to secure ReVault Vault");
	}
});
