import { db } from "../config/firebase.config";

async function fixUsers() {
	console.log("🔧 Fixing user statuses in the vault...");
	const snapshot = await db.collection("users").get();

	const batch = db.batch();
	snapshot.docs.forEach((doc) => {
		batch.update(doc.ref, { isActive: true });
	});

	await batch.commit();
	console.log(`✅ Successfully activated ${snapshot.size} accounts.`);
	process.exit();
}

fixUsers();
