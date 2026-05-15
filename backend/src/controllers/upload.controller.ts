import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../middleware/upload';
import { deleteImage } from '../services/cloudinary.service';

export const uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const folder = (req.query.folder as string) || 'revault';
    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await uploadToCloudinary(req.file.buffer, folder, isVideo);
    res.json({ url: result.url, publicId: result.publicId, resourceType: isVideo ? 'video' : 'image' });
  } catch (error) { next(error); }
};

export const uploadMultiple = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) { res.status(400).json({ error: 'No files uploaded' }); return; }
    const files = req.files as Express.Multer.File[];
    const folder = (req.query.folder as string) || 'revault/products';
    
    const results = await Promise.all(files.map(f => {
      const isVideo = f.mimetype.startsWith('video/');
      return uploadToCloudinary(f.buffer, folder, isVideo);
    }));
    
    res.json({ 
      images: results.map((res, i) => ({ 
        url: res.url, 
        publicId: res.publicId,
        resourceType: files[i].mimetype.startsWith('video/') ? 'video' : 'image'
      })) 
    });
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
