import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail Server Error:', error);
  } else {
    console.log('🚀 Mail Server is ready to secure Hira Vault');
  }
});
