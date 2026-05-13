import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
const serviceAccount = JSON.parse(serviceAccountRaw);

// Fix for private key newlines in Vercel environment variables
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
