import { v2 as cloudinary } from "cloudinary";
import { config } from "../config";

cloudinary.config({
	cloud_name: config.cloudinary.cloudName,
	api_key: config.cloudinary.apiKey,
	api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (
	filePath: string,
	folder: string = "revault",
): Promise<{ url: string; publicId: string }> => {
	const result = await cloudinary.uploader.upload(filePath, {
		folder,
		transformation: [
			{ width: 1200, height: 1200, crop: "limit" },
			{ quality: "auto" },
			{ fetch_format: "auto" },
		],
	});

	return {
		url: result.secure_url,
		publicId: result.public_id,
	};
};

export const uploadMultipleImages = async (
	filePaths: string[],
	folder: string = "revault",
): Promise<{ url: string; publicId: string }[]> => {
	const uploads = filePaths.map((path) => uploadImage(path, folder));
	return Promise.all(uploads);
};

export const deleteImage = async (publicId: string): Promise<void> => {
	await cloudinary.uploader.destroy(publicId);
};

export const deleteMultipleImages = async (
	publicIds: string[],
): Promise<void> => {
	if (publicIds.length === 0) return;
	await cloudinary.api.delete_resources(publicIds);
};

export default cloudinary;
