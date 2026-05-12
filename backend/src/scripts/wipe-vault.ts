import { db } from '../config/firebase.config';

async function wipeVault() {
  console.log('🧹 Preparing to wipe the 2026 Vault...');
  
  const keepUserId = 'PfwVL5LlaHWNEpx2F9EoVeg4r5S2'; // Your current user ID

  const collections = ['products', 'orders', 'payouts', 'wishlist'];
  
  for (const col of collections) {
    const snap = await db.collection(col).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Cleared ${snap.size} documents from ${col}`);
  }

  // Handle Users (Keep you, delete others)
  const usersSnap = await db.collection('users').get();
  const userBatch = db.batch();
  usersSnap.docs.forEach(doc => {
    if (doc.id !== keepUserId) userBatch.delete(doc.ref);
  });
  await userBatch.commit();
  console.log(`✅ Cleared ${usersSnap.size - 1} other users.`);

  // Handle Sellers (Keep you, delete others, reset stats)
  const sellersSnap = await db.collection('sellers').get();
  const sellerBatch = db.batch();
  sellersSnap.docs.forEach(doc => {
    if (doc.id !== keepUserId) {
      sellerBatch.delete(doc.ref);
    } else {
      // Reset your stats
      sellerBatch.update(doc.ref, {
        totalEarnings: 0,
        totalSales: 0,
        pendingBalance: 0,
        rating: 5,
        verificationStatus: 'ACTIVE', // Keep you verified
        isVerified: true
      });
    }
  });
  await sellerBatch.commit();
  console.log(`✅ Cleared other sellers and reset your boutique stats.`);

  console.log('✨ Vault is now pristine! You are the only elite member left.');
  process.exit();
}

wipeVault();
