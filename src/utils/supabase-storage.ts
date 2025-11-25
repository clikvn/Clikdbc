/**
 * Supabase Storage utilities for image uploads
 * Handles uploading, deleting, and managing images in Supabase Storage buckets
 */

import { supabase } from '../lib/supabase';

const PROFILE_IMAGES_BUCKET = 'profile-images';
const AVATAR_IMAGES_BUCKET = 'avatar-images';

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return mimeToExt[mimeType] || 'jpg';
}

/**
 * Upload background image to Supabase Storage
 * @param file - Image file to upload
 * @param userCode - User code for organizing files
 * @returns Public URL of uploaded image or error
 */
export async function uploadBackgroundImage(
  file: File,
  userCode: string
): Promise<{ url: string } | { error: string }> {
  try {
    const timestamp = Date.now();
    const extension = getFileExtension(file.type);
    const fileName = `${userCode}/background-${timestamp}.${extension}`;
    const filePath = fileName;

    console.log('Uploading background image:', { fileName, size: file.size });

    const { data, error } = await supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite - use timestamp for uniqueness
      });

    if (error) {
      console.error('Error uploading background image:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(PROFILE_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    console.log('Background image uploaded successfully:', publicUrl);
    return { url: publicUrl };
  } catch (error) {
    console.error('Exception uploading background image:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Upload avatar image to Supabase Storage
 * @param file - Image file to upload
 * @param userCode - User code for organizing files
 * @returns Public URL of uploaded image or error
 */
export async function uploadAvatarImage(
  file: File,
  userCode: string
): Promise<{ url: string } | { error: string }> {
  try {
    const timestamp = Date.now();
    const extension = getFileExtension(file.type);
    const fileName = `${userCode}/avatar-${timestamp}.${extension}`;
    const filePath = fileName;

    console.log('Uploading avatar image:', { fileName, size: file.size });

    const { data, error } = await supabase.storage
      .from(AVATAR_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite - use timestamp for uniqueness
      });

    if (error) {
      console.error('Error uploading avatar image:', error);
      return { error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(AVATAR_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    console.log('Avatar image uploaded successfully:', publicUrl);
    return { url: publicUrl };
  } catch (error) {
    console.error('Exception uploading avatar image:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete image from Supabase Storage
 * @param url - Full URL of the image to delete
 * @returns Success status or error
 */
export async function deleteImageFromStorage(
  url: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract bucket and path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlPattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
    const match = url.match(urlPattern);

    if (!match) {
      console.error('Invalid storage URL format:', url);
      return { success: false, error: 'Invalid storage URL format' };
    }

    const [, bucket, path] = match;
    console.log('Deleting image from storage:', { bucket, path });

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting image from storage:', error);
      return { success: false, error: error.message };
    }

    console.log('Image deleted successfully from storage');
    return { success: true };
  } catch (error) {
    console.error('Exception deleting image from storage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get public URL for a stored image
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns Public URL
 */
export function getImagePublicUrl(bucket: string, path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return publicUrl;
}

