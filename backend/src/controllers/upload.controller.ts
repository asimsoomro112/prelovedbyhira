import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../middleware/upload';
import { deleteImage } from '../services/cloudinary.service';

export const uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const folder = (req.query.folder as string) || 'prelovebyhira';
    // Use buffer from memory storage (not file path)
    const result = await uploadToCloudinary(req.file.buffer, folder);
    res.json({ url: result.url, publicId: result.publicId });
  } catch (error) { next(error); }
};

export const uploadMultiple = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) { res.status(400).json({ error: 'No files uploaded' }); return; }
    const files = req.files as Express.Multer.File[];
    const folder = (req.query.folder as string) || 'prelovebyhira/products';
    // Use buffer from memory storage (not file path)
    const results = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, folder)));
    res.json({ images: results.map(res => ({ url: res.url, publicId: res.publicId })) });
  } catch (error) { next(error); }
};

export const deleteSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { publicId } = req.body;
    if (!publicId) { res.status(400).json({ error: 'Public ID required' }); return; }
    await deleteImage(publicId);
    res.json({ message: 'Image deleted' });
  } catch (error) { next(error); }
};
