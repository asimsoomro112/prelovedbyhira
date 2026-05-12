import { PrismaClient, Role, VerificationStatus, ProductCondition, ProductCategory, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PrelovedByHira database...');
  
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@preloved.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@preloved.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      phone: '03001111111'
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create Sellers
  const sellersData = [
    { name: 'Hira Khan', email: 'hira@example.com', phone: '03002222222' },
    { name: 'Sara Ahmed', email: 'sara@example.com', phone: '03003333333' },
    { name: 'Zainab Ali', email: 'zainab@example.com', phone: '03004444444' },
  ];

  const sellers = [];
  for (const s of sellersData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: Role.SELLER,
        isVerified: true,
        phone: s.phone
      },
    });

    const seller = await prisma.seller.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        verificationStatus: VerificationStatus.APPROVED,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: { bank: 'HBL', account: '123456789', title: s.name },
        totalEarnings: 0,
        totalPayouts: 0,
        pendingBalance: 0
      },
    });
    sellers.push(seller);
    console.log('Seller created:', user.email);
  }

  // 3. Create Products
  const products = [
    {
      title: 'Silk Evening Gown',
      description: 'Elegant red silk gown, perfect for weddings.',
      brand: 'Khaadi',
      originalPrice: 15000,
      sellingPrice: 8000,
      condition: ProductCondition.EXCELLENT,
      usageDuration: 'Worn once',
      category: ProductCategory.DRESSES,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[0].id,
    },
    {
      title: 'Embroidered Lawn Suit',
      description: 'Beautiful 3-piece embroidered lawn suit.',
      brand: 'Gul Ahmed',
      originalPrice: 6000,
      sellingPrice: 3500,
      condition: ProductCondition.GOOD,
      usageDuration: 'Worn 2-3 times',
      category: ProductCategory.DRESSES,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[0].id,
    },
    {
      title: 'Leather Handbag',
      description: 'Classic black leather handbag.',
      brand: 'Charles & Keith',
      originalPrice: 12000,
      sellingPrice: 5000,
      condition: ProductCondition.GOOD,
      usageDuration: '6 months',
      category: ProductCategory.BAGS,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[1].id,
    },
    {
      title: 'Stiletto Heels',
      description: 'Nude stilettos, very comfortable.',
      brand: 'Stylo',
      originalPrice: 4000,
      sellingPrice: 2000,
      condition: ProductCondition.EXCELLENT,
      usageDuration: 'New without tags',
      category: ProductCategory.SHOES,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[1].id,
    },
    {
      title: 'Gold Plated Necklace',
      description: 'Stunning gold plated traditional necklace.',
      brand: 'Local Artisan',
      originalPrice: 3000,
      sellingPrice: 1500,
      condition: ProductCondition.GOOD,
      usageDuration: 'Used twice',
      category: ProductCategory.JEWELRY,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[2].id,
    },
    {
      title: 'Cotton Kurti',
      description: 'Casual cotton kurti for everyday wear.',
      brand: 'Ethnic',
      originalPrice: 2500,
      sellingPrice: 1200,
      condition: ProductCondition.FAIR,
      usageDuration: 'Frequent use',
      category: ProductCategory.TOPS,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[2].id,
    },
    {
      title: 'Velvet Shawl',
      description: 'Luxurious velvet shawl with embroidery.',
      brand: 'Maria B',
      originalPrice: 10000,
      sellingPrice: 6000,
      condition: ProductCondition.EXCELLENT,
      usageDuration: 'Worn once',
      category: ProductCategory.MORE,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[0].id,
    },
    {
      title: 'Formal Trousers',
      description: 'Black formal trousers, slim fit.',
      brand: 'Outfitters',
      originalPrice: 3500,
      sellingPrice: 1500,
      condition: ProductCondition.GOOD,
      usageDuration: '1 month',
      category: ProductCategory.MORE,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[1].id,
    },
    {
      title: 'Denim Jacket',
      description: 'Blue denim jacket, oversized fit.',
      brand: 'Levis',
      originalPrice: 8000,
      sellingPrice: 4000,
      condition: ProductCondition.GOOD,
      usageDuration: '1 winter',
      category: ProductCategory.TOPS,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[2].id,
    },
    {
      title: 'Bridal Clutch',
      description: 'Sparkly bridal clutch with chain.',
      brand: 'Dune',
      originalPrice: 7000,
      sellingPrice: 3000,
      condition: ProductCondition.EXCELLENT,
      usageDuration: 'Worn once',
      category: ProductCategory.BAGS,
      images: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'],
      status: ProductStatus.ACTIVE,
      sellerId: sellers[0].id,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p,
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
