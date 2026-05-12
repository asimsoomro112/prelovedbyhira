import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadImage, uploadMultipleImages, deleteImage } from '../services/cloudinary.service';
import fs from 'fs';

export const uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const folder = (req.query.folder as string) || 'prelovebyhira';
    const result = await uploadImage(req.file.path, folder);
    fs.unlinkSync(req.file.path);
    res.json(result);
  } catch (error) { next(error); }
};

export const uploadMultiple = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) { res.status(400).json({ error: 'No files uploaded' }); return; }
    const files = req.files as Express.Multer.File[];
    const folder = (req.query.folder as string) || 'prelovebyhira/products';
    const results = await uploadMultipleImages(files.map(f => f.path), folder);
    files.forEach(f => fs.unlinkSync(f.path));
    res.json({ images: results });
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
