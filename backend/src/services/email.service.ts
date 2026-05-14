import { transporter } from '../config/mail.config';

const GOLD = '#D4AF37';
const DARK = '#090909';
const CREAM = '#FFFDF9';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:italic,wght@0,700;1,700&family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { margin: 0; padding: 0; background-color: ${CREAM}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: ${CREAM}; padding-bottom: 60px; }
        .main { background-color: ${DARK}; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 48px; overflow: hidden; color: #ffffff; margin-top: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
        .header { padding: 60px 40px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1); }
        .content { padding: 60px 40px; text-align: center; }
        .footer { padding: 40px; text-align: center; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(212, 175, 55, 0.1); }
        .h1 { font-family: 'Playfair Display', serif; font-size: 42px; margin: 0; font-weight: 700; color: #ffffff; letter-spacing: -1px; }
        .h1 span { color: ${GOLD}; font-style: italic; }
        .h2 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 5px; color: ${GOLD}; margin-bottom: 15px; display: block; }
        .text { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); margin-bottom: 30px; }
        .otp { font-size: 56px; font-weight: 700; color: ${GOLD}; letter-spacing: 15px; margin: 40px 0; font-family: 'Inter', sans-serif; }
        .btn { display: inline-block; padding: 20px 45px; background: linear-gradient(135deg, ${GOLD}, #B8860B); color: #ffffff; text-decoration: none; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3); }
        .footer-text { font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 2px; line-height: 2; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main">
            <div class="header">
                <span class="h2">PrelovedByHira 2026</span>
                <h1 class="h1">Luxury <span>Vault.</span></h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p class="footer-text">
                    This is an automated 256-bit encrypted secure exchange.<br>
                    © 2026 PrelovedByHira • Pakistan's #1 Luxury Trade Platform
                </p>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const sendOTPEmail = async (email: string, otp: string) => {
  const content = `
    <span class="h2">Identity Verification</span>
    <p class="text">Welcome to the vault. Use the highly secure 2026 encryption key below to authenticate your access.</p>
    <div class="otp">${otp}</div>
    <p class="text" style="font-size: 12px;">This key expires in 10 minutes. If you did not request this, please report to Hira AI Concierge immediately.</p>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🔑 ${otp} is your Hira Access Key`,
    html: baseTemplate(content),
  });
};

export const sendOrderConfirmation = async (email: string, orderData: any) => {
  const content = `
    <span class="h2">Order Confirmed</span>
    <p class="text">Your luxury acquisition is officially secured. Funds are currently locked in our <b>Escrow Protected Vault</b> until you verify the item.</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Order Details</p>
        <p style="margin: 5px 0; font-size: 14px;">Order ID: <b>#ORD-${orderData.id}</b></p>
        <p style="margin: 5px 0; font-size: 14px;">Amount: <b>Rs. ${orderData.total.toLocaleString()}</b></p>
    </div>
    <a href="https://prelovedbyhira.com/customer/dashboard" class="btn">Track in Vault</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `✨ Order Secured: #ORD-${orderData.id}`,
    html: baseTemplate(content),
  });
};

export const sendSellerNotification = async (email: string, orderData: any) => {
  const content = `
    <span class="h2">New Sale Alert</span>
    <p class="text">Congratulations! A customer has secured your listing. Please prepare for shipment within 24 hours to maintain your Elite Seller status.</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Sale Details</p>
        <p style="margin: 5px 0; font-size: 14px;">Item: <b>${orderData.itemName}</b></p>
        <p style="margin: 5px 0; font-size: 14px;">Your Earnings: <b>Rs. ${orderData.earnings.toLocaleString()}</b></p>
    </div>
    <a href="https://prelovedbyhira.com/seller/dashboard" class="btn">Go to Dashboard</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `💰 You just made a sale! Item: ${orderData.itemName}`,
    html: baseTemplate(content),
  });
};

export const sendSellerRejectionEmail = async (email: string, name: string, reason: string) => {
  const content = `
    <span class="h2">Verification Update</span>
    <p class="text">Dear <b>${name}</b>, unfortunately your seller verification has been declined.</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Reason</p>
        <p style="margin: 5px 0; font-size: 14px;">${reason}</p>
    </div>
    <p class="text">You may re-apply with corrected documents at any time from your seller dashboard.</p>
    <a href="https://prelovedbyhira.com/seller/verification" class="btn">Re-Apply Now</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Seller Verification Update — ${name}`,
    html: baseTemplate(content),
  });
};

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const content = `
    <span class="h2">Verify Your Access</span>
    <p class="text">Welcome to the inner circle, <b>${name}</b>. Please verify your identity to unlock the full potential of our luxury marketplace.</p>
    <a href="https://prelovedbyhira.com/verify-email/${token}" class="btn">Verify Securely</a>
    <p class="text" style="font-size: 10px; margin-top: 30px;">This link will expire in 24 hours.</p>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🥂 Welcome to the Vault, ${name}`,
    html: baseTemplate(content),
  });
};

export const sendPaymentRejectedEmail = async (email: string, orderId: string, reason: string) => {
  const content = `
    <span class="h2">Payment Rejected</span>
    <p class="text">Our Neural Audit has identified an issue with your payment proof for order <b>#${orderId.slice(-8).toUpperCase()}</b>.</p>
    <div style="background: rgba(211, 47, 47, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(211, 47, 47, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: #d32f2f; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Reason for Rejection</p>
        <p style="margin: 5px 0; font-size: 14px; color: #d32f2f;">${reason}</p>
    </div>
    <p class="text">Please log in to your dashboard and re-upload a valid bank or wallet receipt to secure your item.</p>
    <a href="https://prelovedbyhira.com/customer/orders" class="btn">Re-upload Proof</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `❌ Action Required: Payment Proof Rejected (#${orderId.slice(-8).toUpperCase()})`,
    html: baseTemplate(content),
  });
};

export const sendOrderStatusUpdate = async (email: string, orderId: string, status: string, itemName: string) => {
  const statusIcons: any = {
    'PAID': '💰',
    'SHIPPED': '🚚',
    'DELIVERED': '🎁',
    'CONFIRMED': '🤝'
  };

  const statusMessages: any = {
    'PAID': 'Payment verified. Seller is preparing your item.',
    'SHIPPED': 'Exciting news! Your item is on its way.',
    'DELIVERED': 'Your luxury item has arrived at your location.',
    'CONFIRMED': 'Trade completed. Thank you for using Hira Vault.'
  };

  const content = `
    <span class="h2">Order Status Update</span>
    <h1 class="h1" style="font-size: 28px; margin: 20px 0;">${status}</h1>
    <p class="text">${statusMessages[status] || 'Your order status has been updated.'}</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="margin: 5px 0; font-size: 14px;">Order: <b>#${orderId.slice(-8).toUpperCase()}</b></p>
        <p style="margin: 5px 0; font-size: 14px;">Item: <b>${itemName}</b></p>
    </div>
    <a href="https://prelovedbyhira.com/customer/orders" class="btn">View in Vault</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${statusIcons[status] || '✨'} Order ${status}: ${itemName}`,
    html: baseTemplate(content),
  });
};
