# ReVault Marketplace 👗✨ (2026 Edition)

Welcome to **ReVault**, Pakistan's elite 2026-standard luxury marketplace. This platform is now powered by a **Serverless Cloud Architecture** (Firebase + Firestore + Cloudinary), featuring AI identity verification and neural visual search.

## 🚀 2026 Elite Features

- **Hira AI Concierge**: Neural bilingual assistant (Roman Urdu/English) for 24/7 support.
- **Visual Search**: Upload a photo to find matching luxury items in the vault.
- **AI Identity Scanner**: Automated CNIC scanning for instant seller verification.
- **Sustainability Passport**: Real-time carbon/water impact tracking for every purchase.
- **Premium UX**: OLED-optimized dark mode, glassmorphism, and 60fps animations.

## 🛠️ 2026 Tech Stack

- **Frontend**: Next.js 16 (App Router), Framer Motion, Zustand, Firebase Client.
- **Backend**: Node.js + Express, **Firebase Admin SDK (Firestore & Auth)**.
- **Cloud/AI**: Cloudinary (Media), Google SMTP (Email), AI Neural Vision.

## 📦 Local Setup Instructions

### 1. Prerequisites
- Node.js 20+
- A Firebase Project (with Firestore and Auth enabled)
- A Cloudinary Account (for product media)

### 2. Environment Variables

#### Backend (`backend/.env`)
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}' # Full JSON from Firebase Settings
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

### 3. Installation & Run

```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install

# Run Everything (Open two terminals)
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

## 🔐 How to Test the 2026 Vault

1. **Sign Up**: Go to `/register` and create an account. It will sync with Firebase.
2. **Verify Seller**: Go to `/seller/verify` and upload an ID image. Watch the AI scan and populate your name.
3. **Visual Search**: Upload a fashion photo in the search bar to find similar luxury items.
4. **Checkout**: Experience the 3-step escrow protected payment flow.

## 📄 License
MIT License. Developed for PrelovedByHira 2026.
