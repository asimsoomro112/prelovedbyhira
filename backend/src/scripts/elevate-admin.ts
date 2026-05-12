import { db } from '../config/firebase.config';

async function elevateAdmin() {
  const userId = 'PfwVL5LlaHWNEpx2F9EoVeg4r5S2'; // Your user ID
  
  console.log(`🚀 Elevating User ${userId} to ADMIN role...`);

  await db.collection('users').doc(userId).update({
    role: 'ADMIN'
  });

  console.log('✅ Success! You are now a Super Admin of the Vault.');
  console.log('Please log out and log back in to see the Admin Panel.');
  process.exit();
}

elevateAdmin();
