import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Creates a transformed image URL for ImageKit.
 * @param url The original image URL.
 * @param transformations The transformation options for the image.
 */
export function getTransformedImage(
  url: string,
  transformations: { width?: number; height?: number; quality?: number; crop?: string; }
): string {
  const urlEndpoint = 'https://ik.imagekit.io/ilk0tj3rj';
  if (!url || !url.startsWith(urlEndpoint)) {
    return url;
  }

  const imagePath = url.substring(urlEndpoint.length);
  
  const trParams: string[] = [];
  if (transformations.width) trParams.push(`w-${transformations.width}`);
  if (transformations.height) trParams.push(`h-${transformations.height}`);
  if (transformations.quality) trParams.push(`q-${transformations.quality}`);
  if (transformations.crop) trParams.push(`c-${transformations.crop}`);

  if (trParams.length === 0) {
    return url;
  }

  // Prevents adding 'tr:' if transformations are already present
  if (imagePath.startsWith('/tr:')) {
    return `${urlEndpoint}${imagePath}`;
  }

  return `${urlEndpoint}/tr:${trParams.join(',')}${imagePath}`;
}
