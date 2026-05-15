import { db } from '../config/firebase.config';

async function seed() {
  console.log('🚀 Seeding 2026 Luxury Vault...');

  try {
    // 1. Create a Seller
    const sellerId = 'test-seller-123';
    const sellerData = {
      name: 'ReVault Designer Wear',
      email: 'seller@revault.com',
      phone: '03001234567',
      role: 'SELLER',
      isVerified: true,
      bio: 'Premium boutique specializing in authentic preloved bridal and formal wear.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(sellerId).set(sellerData);
    console.log('✅ Seller account created');

    // 2. Create Luxury Products
    const products = [
      {
        title: 'Sabyasachi Red Bridal Lehnga',
        brand: 'Sabyasachi',
        originalPrice: 850000,
        sellingPrice: 420000,
        category: 'Bridal',
        size: 'Medium',
        condition: 'Pristine',
        description: 'Exquisite red velvet lehnga with intricate hand-embroidery. Worn once for 4 hours. Authenticity card included.',
        images: [
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2',
          'https://images.unsplash.com/photo-1583391733990-2811a766f6f9'
        ],
        status: 'ACTIVE',
        sellerId: sellerId,
        views: 154,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: 'Pure Raw Silk formal Suit',
        brand: 'Élan',
        originalPrice: 45000,
        sellingPrice: 22000,
        category: 'Formal',
        size: 'Small',
        condition: 'Excellent',
        description: 'Hand-worked teal raw silk suit with organza dupatta. Perfect for shadi guest wear.',
        images: [
          'https://images.unsplash.com/photo-1610030469668-93530c17bc21'
        ],
        status: 'ACTIVE',
        sellerId: sellerId,
        views: 89,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: 'Handcrafted Kundan Choker Set',
        brand: 'Heritage Jewels',
        originalPrice: 120000,
        sellingPrice: 75000,
        category: 'Jewelry',
        size: 'Adjustable',
        condition: 'Like New',
        description: 'Heavy Kundan choker with semi-precious stones and pearls. Gold plated.',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338'
        ],
        status: 'ACTIVE',
        sellerId: sellerId,
        views: 210,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const product of products) {
      await db.collection('products').add(product);
    }

    console.log('✅ 3 Luxury items added to the vault');
    console.log('✨ Seeding complete! You can now login as seller@revault.com (Use the Register page to create this user in Auth first if testing Login).');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit();
  }
}

seed();
