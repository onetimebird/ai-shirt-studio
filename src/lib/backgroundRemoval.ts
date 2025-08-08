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

// Advanced white background removal with anti-aliasing handling
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
    
    // Multi-pass processing for professional results (BGBye-inspired pipeline)
    let mask = createInitialMask(data, width, height);
    mask = refineEdges(mask, data, width, height);
    mask = morphologicalCleanup(mask, width, height);
    mask = applyAntiAliasing(mask, width, height);
    mask = applyFeathering(mask, width, height, 2); // BGBye-style feathering
    
    // Apply the refined mask with normalization
    applyMaskToImage(data, mask);
    
    ctx.putImageData(imageData, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Advanced background removal completed');
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

// Pass 1: Create initial mask using smart flood-fill
function createInitialMask(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const mask = new Float32Array(width * height);
  const visited = new Set<number>();
  const toRemove = new Set<number>();
  
  // Sample background color from corners for more accurate detection
  const getCornerColors = () => {
    const corners = [
      0, // top-left
      (width - 1) * 4, // top-right
      (height - 1) * width * 4, // bottom-left
      ((height - 1) * width + width - 1) * 4 // bottom-right
    ];
    
    const colors = corners.map(idx => ({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2]
    }));
    
    // Find the most common corner color (likely the background)
    const avgColor = {
      r: Math.round(colors.reduce((sum, c) => sum + c.r, 0) / 4),
      g: Math.round(colors.reduce((sum, c) => sum + c.g, 0) / 4),
      b: Math.round(colors.reduce((sum, c) => sum + c.b, 0) / 4)
    };
    
    return avgColor;
  };
  
  const backgroundColor = getCornerColors();
  
  // Enhanced color distance calculation
  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    const dr = r1 - r2;
    const dg = g1 - g2; 
    const db = b1 - b2;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };
  
  const isBackgroundColor = (r: number, g: number, b: number) => {
    // Check if it matches the detected background color
    const bgDistance = colorDistance(r, g, b, backgroundColor.r, backgroundColor.g, backgroundColor.b);
    
    // Very strict threshold - only exact or very close matches
    return bgDistance < 15;
  };
  
  const getIndex = (x: number, y: number) => y * width + x;
  
  // Flood fill from edges - only follows continuous background color
  const floodFill = (startX: number, startY: number) => {
    const stack = [{ x: startX, y: startY }];
    
    // Check if starting pixel is even background color
    const startIdx = getIndex(startX, startY) * 4;
    if (!isBackgroundColor(data[startIdx], data[startIdx + 1], data[startIdx + 2])) {
      return; // Don't flood fill from non-background pixels
    }
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const pixelIndex = getIndex(x, y);
      if (visited.has(pixelIndex)) continue;
      
      visited.add(pixelIndex);
      
      const dataIndex = pixelIndex * 4;
      const r = data[dataIndex];
      const g = data[dataIndex + 1];
      const b = data[dataIndex + 2];
      
      if (isBackgroundColor(r, g, b)) {
        toRemove.add(pixelIndex);
        // Add neighboring pixels - only direct neighbors for stricter flood fill
        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
      }
    }
  };
  
  // Start from all edges
  for (let x = 0; x < width; x++) {
    floodFill(x, 0);
    floodFill(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    floodFill(0, y);
    floodFill(width - 1, y);
  }
  
  // Create mask (1 = keep, 0 = remove)
  mask.fill(1);
  for (const pixelIndex of toRemove) {
    mask[pixelIndex] = 0;
  }
  
  return mask;
}

// Pass 2: Edge-aware refinement using gradient information
function refineEdges(mask: Float32Array, data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const refined = new Float32Array(mask.length);
  
  // Sobel edge detection kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const centerIdx = y * width + x;
      
      // Calculate gradient magnitude
      let gx = 0, gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIdx = (y + ky) * width + (x + kx);
          const dataIdx = pixelIdx * 4;
          const gray = (data[dataIdx] + data[dataIdx + 1] + data[dataIdx + 2]) / 3;
          
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }
      
      const gradient = Math.sqrt(gx * gx + gy * gy);
      
      // If we're near an edge, use gradient to refine the mask
      if (gradient > 30) {
        // Edge pixel - use more sophisticated blending
        refined[centerIdx] = mask[centerIdx] * (1 - gradient / 255);
      } else {
        refined[centerIdx] = mask[centerIdx];
      }
    }
  }
  
  return refined;
}

// Pass 3: Morphological cleanup (opening and closing operations)
function morphologicalCleanup(mask: Float32Array, width: number, height: number): Float32Array {
  // Apply morphological opening (erosion followed by dilation)
  let result = erode(mask, width, height, 1);
  result = dilate(result, width, height, 1);
  
  // Then morphological closing (dilation followed by erosion)
  result = dilate(result, width, height, 1);
  result = erode(result, width, height, 1);
  
  return result;
}

// Erosion operation
function erode(mask: Float32Array, width: number, height: number, radius: number): Float32Array {
  const result = new Float32Array(mask.length);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let minVal = 1;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = (y + ky) * width + (x + kx);
          minVal = Math.min(minVal, mask[idx]);
        }
      }
      
      result[y * width + x] = minVal;
    }
  }
  
  return result;
}

// Dilation operation
function dilate(mask: Float32Array, width: number, height: number, radius: number): Float32Array {
  const result = new Float32Array(mask.length);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let maxVal = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const idx = (y + ky) * width + (x + kx);
          maxVal = Math.max(maxVal, mask[idx]);
        }
      }
      
      result[y * width + x] = maxVal;
    }
  }
  
  return result;
}

// Pass 4: Multi-scale anti-aliasing inspired by BGBye's approach
function applyAntiAliasing(mask: Float32Array, width: number, height: number): Float32Array {
  // Apply multi-scale blur like BGBye's dilated convolutions
  const scales = [0.5, 1.0, 1.5, 2.0]; // Different blur radii for multi-scale smoothing
  const blurred = new Float32Array(mask.length);
  
  for (let i = 0; i < scales.length; i++) {
    const scaleResult = gaussianBlur(mask, width, height, scales[i]);
    const weight = 1.0 / scales.length;
    
    for (let j = 0; j < mask.length; j++) {
      blurred[j] += scaleResult[j] * weight;
    }
  }
  
  return blurred;
}

// Pass 5: Feathering for smooth edges (BGBye technique)
function applyFeathering(mask: Float32Array, width: number, height: number, radius: number): Float32Array {
  const feathered = new Float32Array(mask.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let sum = 0;
      let count = 0;
      
      // Sample neighboring pixels for feathering
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = ny * width + nx;
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const weight = 1 - (distance / radius);
            sum += mask[nIdx] * weight;
            count += weight;
          }
        }
      }
      
      feathered[idx] = count > 0 ? sum / count : mask[idx];
    }
  }
  
  return feathered;
}

// Gaussian blur for smooth anti-aliasing
function gaussianBlur(mask: Float32Array, width: number, height: number, sigma: number): Float32Array {
  const result = new Float32Array(mask.length);
  const radius = Math.ceil(sigma * 3);
  
  // Create Gaussian kernel
  const kernel: number[] = [];
  let kernelSum = 0;
  for (let i = -radius; i <= radius; i++) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    kernelSum += value;
  }
  
  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= kernelSum;
  }
  
  // Apply horizontal blur
  const temp = new Float32Array(mask.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let kx = -radius; kx <= radius; kx++) {
        const sourceX = Math.max(0, Math.min(width - 1, x + kx));
        const idx = y * width + sourceX;
        sum += mask[idx] * kernel[kx + radius];
      }
      temp[y * width + x] = sum;
    }
  }
  
  // Apply vertical blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let ky = -radius; ky <= radius; ky++) {
        const sourceY = Math.max(0, Math.min(height - 1, y + ky));
        const idx = sourceY * width + x;
        sum += temp[idx] * kernel[ky + radius];
      }
      result[y * width + x] = sum;
    }
  }
  
  return result;
}

// Apply the refined mask with BGBye-style normalization and smoothing
function applyMaskToImage(data: Uint8ClampedArray, mask: Float32Array): void {
  // Normalize mask like BGBye does: (result - min) / (max - min)
  let minVal = 1.0;
  let maxVal = 0.0;
  
  for (let i = 0; i < mask.length; i++) {
    minVal = Math.min(minVal, mask[i]);
    maxVal = Math.max(maxVal, mask[i]);
  }
  
  const range = maxVal - minVal;
  if (range > 0) {
    for (let i = 0; i < mask.length; i++) {
      mask[i] = (mask[i] - minVal) / range;
    }
  }
  
  // Apply mask with sigmoid-like smoothing for soft edges (BGBye technique)
  for (let i = 0; i < mask.length; i++) {
    const dataIdx = i * 4;
    const alpha = data[dataIdx + 3];
    
    // Sigmoid-like transformation for smoother transitions
    let maskValue = mask[i];
    maskValue = maskValue * maskValue * (3 - 2 * maskValue); // Smooth step function
    
    data[dataIdx + 3] = Math.round(alpha * maskValue * 255);
  }
}

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
