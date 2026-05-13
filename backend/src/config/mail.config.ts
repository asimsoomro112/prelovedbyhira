import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use App Password for Gmail
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail Server Error:', error);
  } else {
    console.log('🚀 Mail Server is ready to secure Hira Vault');
  }
});
