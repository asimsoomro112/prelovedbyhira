import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT || "{}";
let serviceAccount: any = {};
try {
	serviceAccount = JSON.parse(serviceAccountRaw);
} catch (error) {
	console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Invalid JSON formatting.", error);
}

// Fix for private key newlines in Vercel environment variables
if (serviceAccount.private_key) {
	serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
	if (serviceAccount.project_id) {
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
	} else {
		console.warn("No FIREBASE_SERVICE_ACCOUNT provided, initializing with dummy project ID.");
		admin.initializeApp({
			projectId: "dummy-project-id",
		});
	}
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
