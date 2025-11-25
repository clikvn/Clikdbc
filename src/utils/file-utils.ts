export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  if (file.size > maxSize) {
    return 'Image size should be less than 5MB';
  }

  return null;
}

/**
 * Validate background image file (max 2MB)
 */
export function validateBackgroundImage(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  if (file.size > maxSize) {
    return 'Background image size should be less than 2MB';
  }

  return null;
}

/**
 * Validate avatar image file (max 2MB)
 */
export function validateAvatarImage(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  if (file.size > maxSize) {
    return 'Avatar image size should be less than 2MB';
  }

  return null;
}