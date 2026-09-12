import * as path from "node:path";
import * as dotenv from "dotenv";
import admin from "firebase-admin";

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT || "{}";
const serviceAccount = JSON.parse(serviceAccountRaw);

if (serviceAccount.private_key) {
	serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

const db = admin.firestore();
const auth = admin.auth();

async function main() {
	const email = "seller@prelovedbyhira.com";
	console.log(`🚀 Starting admin restoration for: ${email}`);

	try {
		// 1. Find user in Firebase Auth
		const userRecord = await auth.getUserByEmail(email);
		const uid = userRecord.uid;
		console.log(`✅ Found Auth user: ${uid}`);

		// 2. Update Firestore document
		const userRef = db.collection("users").doc(uid);
		const doc = await userRef.get();

		if (!doc.exists) {
			console.log(
				`⚠️ Firestore document for ${uid} does not exist. Creating it...`,
			);
			await userRef.set({
				email,
				role: "ADMIN",
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		} else {
			console.log(
				`📝 Updating Firestore document. Current role: ${doc.data()?.role}`,
			);
			await userRef.update({
				role: "ADMIN",
				isActive: true,
				updatedAt: new Date().toISOString(),
			});
		}

		// 3. Set Custom Claims (best practice for Firebase)
		await auth.setCustomUserClaims(uid, { role: "ADMIN" });
		console.log(`✨ Custom claims updated to ADMIN for ${uid}`);

		console.log(`\n🎉 SUCCESS! ${email} has been promoted to SUPER ADMIN.`);
		console.log(`Please try logging in again.`);
	} catch (error: any) {
		console.error(`❌ Error during promotion:`, error.message);
	}
}

main().then(() => process.exit(0));
