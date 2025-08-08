import { pipeline, env, RawImage } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

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

// Enhanced white background removal for CSHRTX generated images
export const removeWhiteBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // More aggressive white background removal
    const threshold = 220; // Lower threshold for more aggressive removal
    const tolerance = 30;  // Higher tolerance for edge cleanup
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1]; 
      const b = data[i + 2];
      
      // Check if pixel is close to white
      if (r > threshold && g > threshold && b > threshold) {
        // Calculate how "white" the pixel is
        const whiteness = (r + g + b) / 3;
        
        // More aggressive removal for very white pixels
        if (whiteness > 240) {
          data[i + 3] = 0; // Completely transparent
        } else if (whiteness > threshold) {
          // Gradually fade out near-white pixels
          const alpha = Math.max(0, 255 - (whiteness - threshold) * 8);
          data[i + 3] = alpha;
        }
      }
      
      // Additional edge cleanup - remove gray/off-white pixels near white areas
      if (r > threshold - tolerance && g > threshold - tolerance && b > threshold - tolerance) {
        const grayness = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        if (grayness < 20) { // It's grayish
          const avgColor = (r + g + b) / 3;
          if (avgColor > threshold - 20) {
            data[i + 3] = Math.max(0, data[i + 3] - 100); // Reduce alpha significantly
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('White background removed successfully');
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
};

// Original AI-based background removal (fallback)
export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting AI background removal process...');
    
    // First try the enhanced white background removal for CSHRTX images
    try {
      return await removeWhiteBackground(imageElement);
    } catch (whiteRemovalError) {
      console.log('White background removal failed, falling back to AI removal');
    }
    
    // Initialize the image segmentation pipeline with the RMBG 1.4 model
    const segmentator = await pipeline("image-segmentation", "briaai/RMBG-1.4");
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Convert canvas to blob, then to RawImage
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/jpeg', 0.9);
    });
    
    // Load the image using RawImage
    const sourceImage = await RawImage.fromBlob(blob);
    console.log('Image loaded with RawImage');
    
    // Process the image with the segmentation model - more aggressive settings
    console.log('Processing with segmentation model...');
    const [result] = await segmentator(sourceImage, {
      threshold: 0.3, // Lower threshold for more aggressive removal
    });
    
    console.log('Segmentation result:', result);
    
    if (!result || !result.mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = sourceImage.width;
    outputCanvas.height = sourceImage.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image to output canvas
    const sourceImageCanvas = sourceImage.toCanvas();
    outputCtx.drawImage(sourceImageCanvas, 0, 0);
    
    // Get the mask data
    const maskImage = result.mask;
    const maskCanvas = maskImage.toCanvas();
    
    // Apply the mask to create transparency with edge smoothing
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const outputData = outputImageData.data;
    
    // Create a temporary canvas to get mask data
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Could not get mask canvas context');
    
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const maskData = maskImageData.data;
    
    // Apply mask to alpha channel with better edge handling
    for (let i = 0; i < outputData.length; i += 4) {
      const maskIndex = Math.floor(i / 4) * 4;
      // Use the red channel of the mask (assuming grayscale mask)
      let alpha = maskData[maskIndex];
      
      // Enhanced alpha processing for cleaner edges
      if (alpha < 50) {
        alpha = 0; // Make very transparent areas completely transparent
      } else if (alpha < 128) {
        alpha = Math.max(0, alpha - 30); // Reduce semi-transparent areas
      }
      
      outputData[i + 3] = alpha; // Set alpha channel
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Enhanced mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob with AI removal');
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

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for cross-origin images
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};
