/**
 * Utility to process and optimize image files client-side before upload.
 * Resizes large photos and compresses them to lightweight Base64 WebP/JPEG data URLs.
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function optimizeImageFile(
  file: File,
  options: OptimizeOptions = {}
): Promise<string> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options;

  if (!file.type.startsWith('image/')) {
    throw new Error(`El archivo "${file.name}" no es una imagen válida.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Error al leer el archivo "${file.name}".`));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback: If image fails to render on canvas (e.g. svg or raw), return raw data url
        resolve(reader.result as string);
      };
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(reader.result as string);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Attempt WebP first, fallback to JPEG
          let outputType = 'image/jpeg';
          try {
            const webpData = canvas.toDataURL('image/webp', quality);
            if (webpData.startsWith('data:image/webp')) {
              outputType = 'image/webp';
              resolve(webpData);
              return;
            }
          } catch {
            // Fallback to jpeg
          }

          const jpegData = canvas.toDataURL(outputType, quality);
          resolve(jpegData);
        } catch {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function optimizeMultipleImages(
  files: FileList | File[],
  options: OptimizeOptions = {}
): Promise<{ successful: string[]; errors: string[] }> {
  const fileArray = Array.from(files);
  const successful: string[] = [];
  const errors: string[] = [];

  const promises = fileArray.map(async (file) => {
    try {
      const dataUrl = await optimizeImageFile(file, options);
      successful.push(dataUrl);
    } catch (err) {
      errors.push((err as Error).message || `Error procesando ${file.name}`);
    }
  });

  await Promise.all(promises);
  return { successful, errors };
}
