import sharp from 'sharp';

export const optimizeImage = async (buffer: Buffer): Promise<Buffer> => {
  return await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('webp')
    .webp({ quality: 80 })
    .toBuffer();
};
