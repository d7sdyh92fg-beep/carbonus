import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;  
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const PhotoEnhancer: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);

  const enhanceKiaPhotos = async () => {
    setIsProcessing(true);
    toast("Starting photo enhancement...");

    try {
      // Load the existing KIA image from the public folder or lovable uploads
      const kiaPaths = [
        '/lovable-uploads/2f65caa0-2965-4077-a0fe-20723b64baa6.png',
        '/src/assets/kia-ceed-side-clean.png'
      ];
      
      let imageLoaded = false;
      let imageElement: HTMLImageElement | null = null;
      
      // Try to load from different possible locations
      for (const path of kiaPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const blob = await response.blob();
            imageElement = await loadImage(blob);
            imageLoaded = true;
            break;
          }
        } catch (error) {
          console.log(`Failed to load from ${path}, trying next...`);
        }
      }
      
      if (!imageLoaded || !imageElement) {
        throw new Error("Could not load KIA image from any location");
      }
      
      toast("Image loaded, removing background...");
      
      // Remove background
      const enhancedBlob = await removeBackground(imageElement);
      
      // Create download URL for preview
      const downloadUrl = URL.createObjectURL(enhancedBlob);
      setProcessedImages([downloadUrl]);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'kia-ceed-enhanced.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("KIA photo enhanced successfully! Download started.");
      
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error("Failed to enhance photo. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Photo Enhancer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={enhanceKiaPhotos} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Enhance KIA Photos"}
        </Button>
        
        {processedImages.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Enhanced Images:</h3>
            {processedImages.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`Enhanced KIA ${index + 1}`}
                className="w-full rounded border"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
