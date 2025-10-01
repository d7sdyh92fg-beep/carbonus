/**
 * Image processing utilities for compression and format conversion
 */

export async function compressImage(file: File, maxSizeMB: number = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions if image is too large
        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with high quality and reduce if needed
        let quality = 0.9;
        const targetSize = maxSizeMB * 1024 * 1024;
        
        const tryCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // If size is acceptable or quality is already low, resolve
              if (blob.size <= targetSize || q <= 0.5) {
                resolve(blob);
              } else {
                // Try with lower quality
                tryCompress(q - 0.1);
              }
            },
            'image/jpeg',
            q
          );
        };
        
        tryCompress(quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function convertHEICtoJPEG(file: File): Promise<Blob> {
  // For HEIC files, we'll rely on the browser's file input conversion
  // Most modern browsers handle this automatically when accept="image/*" is used
  // If the file is already HEIC and browser doesn't convert, we'll use it as-is
  
  const fileName = file.name.toLowerCase();
  
  // Check if it's a HEIC file
  if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
    // Try to convert using canvas
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // If conversion fails, return original file
            resolve(file);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.9
          );
        };
        
        img.onerror = () => {
          // If image loading fails, return original file
          resolve(file);
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }
  
  // Not a HEIC file, return as-is
  return file;
}

export function getFileSizeInMB(file: Blob): number {
  return file.size / (1024 * 1024);
}

export function shouldCompress(file: Blob, thresholdMB: number = 2): boolean {
  return getFileSizeInMB(file) > thresholdMB;
}
