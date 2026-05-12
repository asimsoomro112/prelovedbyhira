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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only images are allowed', 400));
    }
  },
});

export const uploadToCloudinary = async (buffer: Buffer, folder: string): Promise<string> => {
  // Optimize with Sharp
  const optimizedBuffer = await sharp(buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .toFormat('webp')
    .webp({ quality: 80 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `prelovedbyhira/${folder}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(optimizedBuffer);
  });
};
