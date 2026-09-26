/**
 * GoalMills Social Engine — Cloudinary Upload Utility
 *
 * Uploads generated images to Cloudinary and returns the public URL.
 * Reuses the existing GoalMills Cloudinary account.
 */

import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

let isConfigured = false;

/** Initialize Cloudinary from environment variables */
function ensureConfigured(): boolean {
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('Cloudinary is not configured — images will not be uploaded');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
  return true;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload an image buffer to Cloudinary.
 *
 * @param imageBuffer - The image as a Buffer (PNG or JPEG)
 * @param folder - Cloudinary folder path (default: "social-engine")
 * @param publicId - Optional custom public ID
 */
export async function uploadImage(
  imageBuffer: Buffer,
  folder = 'social-engine',
  publicId?: string
): Promise<UploadResult> {
  if (!ensureConfigured()) {
    return { success: false, error: 'Cloudinary not configured' };
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId || `social_${Date.now()}`,
          resource_type: 'image',
          format: 'png',
          quality: 'auto:best',
          transformation: [
            { fetch_format: 'auto' },
          ],
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(imageBuffer);
    });

    logger.info(`Image uploaded to Cloudinary: ${result.secure_url}`);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (err: any) {
    logger.error('Cloudinary upload failed', err);
    return {
      success: false,
      error: err.message || 'Upload failed',
    };
  }
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  if (!ensureConfigured()) return false;

  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (err) {
    logger.error(`Failed to delete image ${publicId}`, err);
    return false;
  }
}
