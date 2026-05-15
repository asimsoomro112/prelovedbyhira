import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../middleware/upload';
import { AIService } from '../services/ai.service';

export const submitIdentity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const { fullNameEntered } = req.body;

    if (!files.cnicFront || !files.cnicBack) {
      throw new AppError('CNIC Front and Back images are required', 400);
    }

    // 1. Upload to Cloudinary
    const [cnicFrontRes, cnicBackRes] = await Promise.all([
      uploadToCloudinary(files.cnicFront[0].buffer, 'verification'),
      uploadToCloudinary(files.cnicBack[0].buffer, 'verification'),
    ]);

    const cnicFront = cnicFrontRes.url;
    const cnicBack = cnicBackRes.url;

    // 2. Perform AI Neural Scan on the CNIC Front
    console.log(`[AI Verification] Scanning CNIC for user: ${req.user!.email}`);
    const { extractedData, error } = await AIService.scanIdentityDocument(cnicFront);

    if (error) throw new AppError(`AI Scan failed: ${error}`, 500);

    // 3. Match Name (Case Insensitive & Loose Match)
    const extractedName = extractedData.fullName?.toLowerCase() || "";
    const enteredName = fullNameEntered?.toLowerCase() || req.user?.name?.toLowerCase() || "";
    
    // Simple inclusion check or fuzzy match could be better, but we start with equality/inclusion
    const isMatch = extractedName.includes(enteredName) || enteredName.includes(extractedName);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Name mismatch. CNIC name does not match your profile name.",
        extractedName: extractedData.fullName,
        enteredName: fullNameEntered || req.user?.name || "ReVault Member"
      });
    }

    // 4. Update Database (Step 1 Complete)
    const updateData = {
      cnicFront,
      cnicBack,
      cnicNumber: extractedData.cnicNumber,
      verificationStatus: 'IDENTITY_VERIFIED', // Keeping this internal step status
      aiExtractedData: extractedData,
      identityVerifiedAt: new Date().toISOString(),
    };

    await db.collection('sellers').doc(req.user!.id).set(updateData, { merge: true });

    res.json({ 
      success: true,
      message: 'Identity verified successfully by ReVault AI. Please proceed to upload your selfie.',
      extracted: extractedData 
    });
  } catch (error) {
    next(error);
  }
};

export const submitSelfie = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.selfie) {
      throw new AppError('Selfie image is required', 400);
    }

    const selfieResult = await uploadToCloudinary(files.selfie[0].buffer, 'verification');
    const selfieUrl = selfieResult.url;
    const { payoutMethod, payoutDetails } = req.body;

    const updateData: any = {
      selfieUrl,
      verificationStatus: 'PENDING', // Now it's actually pending admin review
      selfieUploadedAt: new Date().toISOString(),
      payoutMethod,
    };

    if (payoutDetails) {
      try {
        updateData.payoutDetails = typeof payoutDetails === 'string' ? JSON.parse(payoutDetails) : payoutDetails;
      } catch (e) {
        updateData.payoutDetails = payoutDetails;
      }
    }

    await db.runTransaction(async (transaction) => {
      const sellerRef = db.collection('sellers').doc(req.user!.id);
      transaction.set(sellerRef, updateData, { merge: true });

      // Automatically save the payout account so it shows up in the Payouts page
      if (payoutMethod && payoutDetails) {
        let detailsObj: any = {};
        try {
          detailsObj = typeof payoutDetails === 'string' ? JSON.parse(payoutDetails) : payoutDetails;
        } catch (e) {
          console.warn("[PAYOUT_SAVE] Failed to parse payoutDetails, using as raw string");
          detailsObj = { accountNumber: payoutDetails };
        }

        const accountRef = db.collection('payout_accounts').doc();
        transaction.set(accountRef, {
          userId: req.user!.id,
          type: payoutMethod, // JAZZCASH, EASYPAISA, BANK_TRANSFER
          details: detailsObj?.accountNumber || detailsObj?.iban || (typeof payoutDetails === 'string' ? payoutDetails : ""),
          title: detailsObj?.accountName || req.user?.name || "ReVault Member",
          bankName: detailsObj?.bankName || "",
          createdAt: new Date().toISOString()
        });
      }
    });

    res.json({ 
      success: true,
      message: 'Selfie uploaded and payout account saved. Waiting for admin approval.' 
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    let sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    // Auto-create seller profile if it's missing but user is a SELLER/ADMIN
    if (!sellerDoc.exists) {
      if (req.user!.role !== 'SELLER' && req.user!.role !== 'ADMIN') {
        throw new AppError('Unauthorized', 403);
      }

      const newSeller = {
        userId: sellerId,
        isVerified: false,
        verificationStatus: 'REQUIRED',
        rating: 5.0,
        totalSales: 0,
        totalEarnings: 0,
        pendingBalance: 0,
        createdAt: new Date().toISOString(),
      };
      
      await db.collection('sellers').doc(sellerId).set(newSeller);
      sellerDoc = await db.collection('sellers').doc(sellerId).get();
    }

    const data = sellerDoc.data();
    let status = data?.verificationStatus;

    // Self-healing: If it says PENDING but no selfie exists, it's actually REQUIRED
    if (status === 'PENDING' && !data?.selfieUrl) {
      status = 'REQUIRED';
    }

    res.json({ 
      status,
      rejectionReason: data?.rejectionReason 
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    let sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    // Auto-create seller profile if it's missing but user is a SELLER/ADMIN
    if (!sellerDoc.exists) {
      if (req.user!.role !== 'SELLER' && req.user!.role !== 'ADMIN') {
        throw new AppError('Unauthorized', 403);
      }

      const newSeller = {
        userId: sellerId,
        isVerified: false,
        verificationStatus: 'REQUIRED',
        rating: 5.0,
        totalSales: 0,
        totalEarnings: 0,
        pendingBalance: 0,
        createdAt: new Date().toISOString(),
      };
      
      await db.collection('sellers').doc(sellerId).set(newSeller);
      sellerDoc = await db.collection('sellers').doc(sellerId).get();
    }
    const seller = sellerDoc.data()!;

    // Stats calculations
    const productsSnapshot = await db.collection('products')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'ACTIVE')
      .get();
    
    const activeProducts = productsSnapshot.size;

    const ordersSnapshot = await db.collection('orders')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'PAID')
      .get();
    
    const pendingOrders = ordersSnapshot.size;

    const recentOrdersSnapshot = await db.collection('orders')
      .where('sellerId', '==', sellerId)
      .limit(5)
      .get();

    const recentOrdersRaw = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch product details for each order to get the title
    const recentOrders = await Promise.all(recentOrdersRaw.map(async (order: any) => {
      if (order.productId) {
        const productDoc = await db.collection('products').doc(order.productId).get();
        return { ...order, product: productDoc.data() };
      }
      return order;
    }));

    recentOrders.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json({
      stats: {
        activeProducts,
        pendingOrders,
        totalEarnings: Number(seller.totalEarnings || 0),
        pendingBalance: Number(seller.pendingBalance || 0)
      },
      recentOrders,
      shopHealth: {
        rating: seller.rating || 5,
        responseRate: "98%",
        completionRate: "100%"
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const snapshot = await db.collection('products')
      .where('sellerId', '==', sellerId)
      .get();

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.sort((a: any, b: any) => (b.createdAt || 0).toString().localeCompare((a.createdAt || 0).toString()));
    
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    let sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    // Auto-create seller profile if it's missing
    if (!sellerDoc.exists) {
      // We allow anyone who is authenticated to see their own potential seller profile
      // which triggers the creation of the REQUIRED state.
      const newSeller = {
        userId: sellerId,
        isVerified: false,
        verificationStatus: 'REQUIRED', // New default status
        rating: 5.0,
        totalSales: 0,
        totalEarnings: 0,
        pendingBalance: 0,
        createdAt: new Date().toISOString(),
      };
      
      await db.collection('sellers').doc(sellerId).set(newSeller);
      sellerDoc = await db.collection('sellers').doc(sellerId).get();
    }

    const seller = sellerDoc.data()!;
    let verificationStatus = seller.verificationStatus;

    // Self-healing: Legacy PENDING status with no submission should be REQUIRED
    if (verificationStatus === 'PENDING' && !seller.selfieUrl) {
      verificationStatus = 'REQUIRED';
    }

    res.json({
      name: req.user?.name || "ReVault Member",
      email: req.user?.email || "",
      avatar: req.user?.avatar || seller.avatar || "",
      ...seller,
      verificationStatus
    });
  } catch (error) {
    next(error);
  }
};

export const updateSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { boutiqueBio, phone, city, location } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const updateData: any = {
      boutiqueBio,
      phone,
      city,
      location,
      updatedAt: new Date().toISOString()
    };

    const userUpdateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Handle Image Uploads
    if (files?.avatar?.[0]) {
      const avatarResult = await uploadToCloudinary(files.avatar[0].buffer, 'avatars');
      const avatarUrl = avatarResult.url;
      updateData.avatar = avatarUrl;
      userUpdateData.avatar = avatarUrl;
    }

    if (files?.coverImage?.[0]) {
      const coverResult = await uploadToCloudinary(files.coverImage[0].buffer, 'covers');
      const coverUrl = coverResult.url;
      updateData.coverImage = coverUrl;
    }

    // Clean up undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    Object.keys(userUpdateData).forEach(key => userUpdateData[key] === undefined && delete userUpdateData[key]);

    // Set with merge: true to avoid "document not found" errors
    await Promise.all([
      db.collection('sellers').doc(sellerId).set(updateData, { merge: true }),
      db.collection('users').doc(sellerId).set(userUpdateData, { merge: true })
    ]);

    res.json({ 
      message: 'Seller identity synchronized with vault',
      avatar: updateData.avatar,
      coverImage: updateData.coverImage
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    
    const [sellerDoc, userDoc, productsSnapshot] = await Promise.all([
      db.collection('sellers').doc(id).get(),
      db.collection('users').doc(id).get(),
      db.collection('products').where('sellerId', '==', id).where('status', '==', 'ACTIVE').get()
    ]);

    if (!sellerDoc.exists || !userDoc.exists) {
      throw new AppError('Shop not found', 404);
    }

    const sellerData = sellerDoc.data()!;
    const userData = userDoc.data()!;
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      shopName: sellerData.shopName || userData.name,
      bio: sellerData.bio || userData.bio || 'Premium seller on Preloved Market.',
      avatar: sellerData.avatar || userData.avatar || null,
      coverImage: sellerData.coverImage || null,
      rating: sellerData.rating || 5.0,
      totalSales: sellerData.totalSales || 0,
      isVerified: sellerData.verificationStatus === 'APPROVED',
      joinedAt: userData.createdAt || sellerData.createdAt,
      city: sellerData.city || userData.city || 'Pakistan',
      products
    });
  } catch (error) {
    next(error);
  }
};
