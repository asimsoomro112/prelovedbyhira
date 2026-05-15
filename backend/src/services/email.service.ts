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

export const sendWelcomeEmail = async (email: string, name: string) => {
  const content = `
    <span class="h2">Vault Access Granted</span>
    <h1 class="h1" style="font-size: 28px; margin: 20px 0;">Welcome, <span>${name}</span></h1>
    <p class="text">Your digital identity has been synchronized with the Hira Luxury Vault. You now have exclusive access to Pakistan's most curated preloved marketplace.</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 10px;">Membership Benefits</p>
        <ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.7); font-size: 14px;">
            <li>Escrow-Protected Transactions</li>
            <li>AI-Verified Luxury Authentication</li>
            <li>Global Designer Network Access</li>
        </ul>
    </div>
    <a href="https://prelovedbyhira.com/products" class="btn">Start Exploring</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🥂 Welcome to the Inner Circle, ${name}`,
    html: baseTemplate(content),
  });
};

export const sendForgotPasswordCode = async (email: string, code: string) => {
  const content = `
    <span class="h2">Account Recovery</span>
    <p class="text">We received a request to unlock your vault access. Use the recovery code below to reset your password.</p>
    <div class="otp">${code}</div>
    <p class="text" style="font-size: 12px;">This code is valid for 15 minutes. If you did not initiate this request, your account is still secure, but we recommend monitoring your activity.</p>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🛡️ ${code} is your Recovery Code`,
    html: baseTemplate(content),
  });
};

export const sendOrderConfirmation = async (email: string, orderData: any) => {
  const content = `
    <span class="h2">Order Confirmation</span>
    <h1 class="h1" style="font-size: 28px; margin: 20px 0;">Acquisition <span>Secured.</span></h1>
    <p class="text">Dear <b>${orderData.customerName}</b>, your request has been synchronized with the Hira Neural Vault. Your funds are protected by our Escrow-Secured protocol.</p>
    
    <div style="background: rgba(255, 255, 255, 0.03); border-radius: 32px; border: 1px solid rgba(212, 175, 55, 0.1); overflow: hidden; margin: 40px 0;">
        <div style="padding: 30px; background: rgba(212, 175, 55, 0.05); border-bottom: 1px solid rgba(212, 175, 55, 0.1); text-align: left;">
            <p style="color: ${GOLD}; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Order Information</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700;">#ORD-${orderData.id.slice(-8).toUpperCase()}</p>
        </div>
        <div style="padding: 30px; text-align: left;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                    <td style="padding-bottom: 10px; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase;">Item Description</td>
                    <td align="right" style="padding-bottom: 10px; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase;">Amount</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0; border-top: 1px solid rgba(212, 175, 55, 0.1);">
                        <p style="margin: 0; font-weight: 700; font-size: 14px;">${orderData.productName}</p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: rgba(255,255,255,0.5);">Verified Merchant: ${orderData.sellerName}</p>
                    </td>
                    <td align="right" style="padding: 15px 0; border-top: 1px solid rgba(212, 175, 55, 0.1); font-weight: 700;">Rs. ${orderData.total.toLocaleString()}</td>
                </tr>
            </table>
            
            <div style="display: flex; gap: 40px; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 30px;">
                <div style="flex: 1;">
                    <p style="color: ${GOLD}; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Payment Method</p>
                    <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.8);">${orderData.paymentMethod}</p>
                </div>
                <div style="flex: 1;">
                    <p style="color: ${GOLD}; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Shipping To</p>
                    <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.8);">${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}</p>
                </div>
            </div>
        </div>
    </div>
    
    <a href="https://prelovedbyhira.com/customer/dashboard" class="btn">Track Order in Vault</a>
    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.3);">Need assistance? Contact our 24/7 Concierge.</p>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🥂 Confirmation: Your luxury acquisition #ORD-${orderData.id.slice(-8).toUpperCase()} is secured`,
    html: baseTemplate(content),
  });
};

export const sendSellerNotification = async (email: string, orderData: any) => {
  const content = `
    <span class="h2">New Sale Alert</span>
    <h1 class="h1" style="font-size: 28px; margin: 20px 0;">Inventory <span>Secured.</span></h1>
    <p class="text">Congratulations! <b>${orderData.customerName}</b> has just purchased your listing. This trade is currently protected by our neural escrow system.</p>
    
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Trade Summary</p>
        <p style="margin: 8px 0; font-size: 14px;">Item: <b style="color: #fff;">${orderData.itemName}</b></p>
        <p style="margin: 8px 0; font-size: 14px;">Earnings: <b style="color: ${GOLD};">Rs. ${orderData.earnings.toLocaleString()}</b></p>
        <p style="margin: 8px 0; font-size: 14px;">Order ID: <b style="color: rgba(255,255,255,0.5);">#ORD-${orderData.id.slice(-8).toUpperCase()}</b></p>
    </div>
    
    <p class="text" style="font-size: 14px;">Funds will be released to your balance once the customer confirms delivery. Please ensure item is ready for dispatch.</p>
    <a href="https://prelovedbyhira.com/seller/dashboard" class="btn">Manage My Sales</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `💰 Sale Confirmed! You just sold: ${orderData.itemName}`,
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

export const sendSellerPaymentConfirmedEmail = async (email: string, orderData: any) => {
  const content = `
    <span class="h2">Payment Confirmed — Ready to Ship</span>
    <p class="text">Great news! Hira Vault has verified the customer's payment for your listing. You are now authorized to ship the item.</p>
    <div style="background: rgba(212, 175, 55, 0.05); padding: 30px; border-radius: 24px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 30px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 15px;">Next Steps</p>
        <p style="margin: 5px 0; font-size: 14px;">1. Pack the item securely.</p>
        <p style="margin: 5px 0; font-size: 14px;">2. Ship to the customer's provided address.</p>
        <p style="margin: 5px 0; font-size: 14px;">3. Update tracking number in your dashboard.</p>
        <p style="margin: 15px 0 5px 0; font-size: 14px;">Order ID: <b>#ORD-${orderData.id.slice(-8).toUpperCase()}</b></p>
    </div>
    <a href="https://prelovedbyhira.com/seller/dashboard" class="btn">View Shipping Address</a>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `📦 Payment Confirmed: Ship your item (#ORD-${orderData.id.slice(-8).toUpperCase()})`,
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
    'PAID': 'Your payment has been successfully synchronized and verified. The merchant has been notified to prepare your shipment.',
    'SHIPPED': 'Exciting news! Your luxury acquisition is now in transit. You can track its progress via your dashboard.',
    'DELIVERED': 'Mission accomplished. Your item has arrived. Please inspect it carefully before confirming delivery in the vault.',
    'CONFIRMED': 'Trade finalized. The escrow funds have been released. Thank you for choosing PrelovedByHira.'
  };

  const content = `
    <span class="h2">Trade Status Update</span>
    <h1 class="h1" style="font-size: 32px; margin: 20px 0;">Order ${status} <span>${statusIcons[status] || ''}</span></h1>
    <p class="text">${statusMessages[status] || 'Your order status has been updated in the neural vault.'}</p>
    
    <div style="background: rgba(212, 175, 55, 0.05); padding: 40px; border-radius: 32px; border: 1px solid rgba(212, 175, 55, 0.1); margin: 40px 0; text-align: left;">
        <p style="color: ${GOLD}; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Tracking Summary</p>
        <div style="margin-bottom: 15px;">
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Reference Number</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #fff;">#ORD-${orderId.slice(-8).toUpperCase()}</p>
        </div>
        <div>
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase;">Product Detail</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 700; color: #fff;">${itemName}</p>
        </div>
    </div>
    
    <a href="https://prelovedbyhira.com/customer/orders" class="btn">View Live Status</a>
    <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.3);">This is an official communication from the PrelovedByHira Luxury Vault.</p>
  `;

  await transporter.sendMail({
    from: `"PrelovedByHira Vault" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${statusIcons[status] || '✨'} Status Update: Order #${orderId.slice(-8).toUpperCase()} is ${status}`,
    html: baseTemplate(content),
  });
};
