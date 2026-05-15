import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './errorHandler';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only images and videos are allowed', 400));
    }
  },
});

export const uploadToCloudinary = async (buffer: Buffer, folder: string, isVideo: boolean = false): Promise<{ url: string; publicId: string }> => {
  let finalBuffer = buffer;
  
  // Optimize ONLY if it's an image
  if (!isVideo) {
    finalBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toFormat('webp')
      .webp({ quality: 85 })
      .toBuffer();
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: `revault/${folder}`,
        resource_type: isVideo ? 'video' : 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id
        });
      }
    );
    uploadStream.end(finalBuffer);
  });
};
