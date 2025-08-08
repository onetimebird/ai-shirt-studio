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
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Smart background removal - only remove edge-connected white pixels
    const visited = new Set<number>();
    const toRemove = new Set<number>();
    
    // Function to check if a pixel is white-ish
    const isWhiteish = (r: number, g: number, b: number) => {
      const threshold = 230; // High threshold for white detection
      return r > threshold && g > threshold && b > threshold;
    };
    
    // Function to get pixel index from coordinates
    const getIndex = (x: number, y: number) => (y * width + x) * 4;
    
    // Function to get coordinates from pixel index
    const getCoords = (index: number) => {
      const pixelIndex = index / 4;
      return { x: pixelIndex % width, y: Math.floor(pixelIndex / width) };
    };
    
    // Flood fill from edges to find background white pixels
    const floodFill = (startX: number, startY: number) => {
      const stack = [{ x: startX, y: startY }];
      
      while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const index = getIndex(x, y);
        if (visited.has(index)) continue;
        
        visited.add(index);
        
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        if (isWhiteish(r, g, b)) {
          toRemove.add(index);
          // Add neighboring pixels to check
          stack.push({ x: x + 1, y });
          stack.push({ x: x - 1, y });
          stack.push({ x, y: y + 1 });
          stack.push({ x, y: y - 1 });
        }
      }
    };
    
    // Start flood fill from all edge pixels
    // Top and bottom edges
    for (let x = 0; x < width; x++) {
      floodFill(x, 0); // Top edge
      floodFill(x, height - 1); // Bottom edge
    }
    
    // Left and right edges
    for (let y = 0; y < height; y++) {
      floodFill(0, y); // Left edge
      floodFill(width - 1, y); // Right edge
    }
    
    // Remove the background pixels
    for (const index of toRemove) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      // Calculate how white the pixel is for gradual removal
      const whiteness = (r + g + b) / 3;
      
      if (whiteness > 245) {
        data[index + 3] = 0; // Completely transparent for very white pixels
      } else if (whiteness > 235) {
        data[index + 3] = Math.max(0, data[index + 3] * 0.3); // Mostly transparent
      } else {
        data[index + 3] = Math.max(0, data[index + 3] * 0.7); // Partially transparent
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Smart white background removed successfully');
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
