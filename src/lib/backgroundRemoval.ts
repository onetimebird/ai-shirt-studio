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

// Advanced white background removal with intelligent edge detection
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
    
    // Intelligent multi-pass processing
    let mask = createSmartMask(data, width, height);
    mask = expandMaskToWhiteAreas(mask, data, width, height);
    mask = detectEnclosedSpaces(mask, data, width, height);
    mask = cleanupInternalWhite(mask, data, width, height);
    mask = smoothMaskEdges(mask, width, height);
    
    // Apply the refined mask
    applyFinalMask(data, mask);
    
    ctx.putImageData(imageData, 0, 0);
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log('Smart background removal completed');
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

// Smart mask creation using BGBye-inspired color analysis
function createSmartMask(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const mask = new Float32Array(width * height);
  mask.fill(1); // Start with keeping everything
  
  // Convert RGB to LAB color space for better perceptual accuracy (BGBye technique)
  const rgbToLab = (r: number, g: number, b: number) => {
    // Simplified RGB to LAB conversion
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    // Convert to XYZ first (simplified)
    const x = rNorm * 0.4124 + gNorm * 0.3576 + bNorm * 0.1805;
    const y = rNorm * 0.2126 + gNorm * 0.7152 + bNorm * 0.0722;
    const z = rNorm * 0.0193 + gNorm * 0.1192 + bNorm * 0.9505;
    
    // Convert XYZ to LAB (simplified)
    const l = 116 * Math.cbrt(y) - 16;
    const a = 500 * (Math.cbrt(x) - Math.cbrt(y));
    const bLab = 200 * (Math.cbrt(y) - Math.cbrt(z));
    
    return { l, a: a, b: bLab };
  };
  
  // Advanced background detection using LAB color space
  const isBackground = (r: number, g: number, b: number, alpha: number) => {
    const lab = rgbToLab(r, g, b);
    const whiteLabDistance = Math.sqrt(
      Math.pow(lab.l - 95, 2) + Math.pow(lab.a - 0, 2) + Math.pow(lab.b - 0, 2)
    );
    
    // Multi-criteria background detection
    const brightness = lab.l;
    const colorfulness = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
    const isHighBrightness = brightness > 85;
    const isLowColor = colorfulness < 15;
    const isFullyOpaque = alpha > 250;
    const isWhiteDistance = whiteLabDistance < 25;
    
    return (isHighBrightness && isLowColor && isFullyOpaque) || isWhiteDistance;
  };
  
  // Find all edge pixels that are white
  const edgeWhitePixels = new Set<number>();
  
  // Check top and bottom edges
  for (let x = 0; x < width; x++) {
    // Top edge
    let idx = x;
    let dataIdx = idx * 4;
    if (isBackground(data[dataIdx], data[dataIdx + 1], data[dataIdx + 2], data[dataIdx + 3])) {
      edgeWhitePixels.add(idx);
    }
    
    // Bottom edge
    idx = (height - 1) * width + x;
    dataIdx = idx * 4;
    if (isBackground(data[dataIdx], data[dataIdx + 1], data[dataIdx + 2], data[dataIdx + 3])) {
      edgeWhitePixels.add(idx);
    }
  }
  
  // Check left and right edges
  for (let y = 0; y < height; y++) {
    // Left edge
    let idx = y * width;
    let dataIdx = idx * 4;
    if (isBackground(data[dataIdx], data[dataIdx + 1], data[dataIdx + 2], data[dataIdx + 3])) {
      edgeWhitePixels.add(idx);
    }
    
    // Right edge
    idx = y * width + (width - 1);
    dataIdx = idx * 4;
    if (isBackground(data[dataIdx], data[dataIdx + 1], data[dataIdx + 2], data[dataIdx + 3])) {
      edgeWhitePixels.add(idx);
    }
  }
  
  // Flood fill from edge white pixels
  const visited = new Set<number>();
  const toRemove = new Set<number>();
  
  const floodFill = (startIdx: number) => {
    const stack = [startIdx];
    
    while (stack.length > 0) {
      const idx = stack.pop()!;
      
      if (visited.has(idx)) continue;
      visited.add(idx);
      
      const x = idx % width;
      const y = Math.floor(idx / width);
      
      const dataIdx = idx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      const a = data[dataIdx + 3];
      
      if (isBackground(r, g, b, a)) {
        toRemove.add(idx);
        
        // Add neighbors
        if (x > 0) stack.push(idx - 1);
        if (x < width - 1) stack.push(idx + 1);
        if (y > 0) stack.push(idx - width);
        if (y < height - 1) stack.push(idx + width);
      }
    }
  };
  
  // Start flood fill from all edge white pixels
  for (const idx of edgeWhitePixels) {
    if (!visited.has(idx)) {
      floodFill(idx);
    }
  }
  
  // Mark pixels for removal
  for (const idx of toRemove) {
    mask[idx] = 0;
  }
  
  return mask;
}

// Pass 2: Expand mask to include white halos and outlines
function expandMaskToWhiteAreas(mask: Float32Array, data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const expanded = new Float32Array(mask);
  
  // Look for white pixels adjacent to removed areas (halos)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Skip if already marked for removal
      if (mask[idx] === 0) continue;
      
      const dataIdx = idx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      
      // Check if this is a white/near-white pixel
      const brightness = (r + g + b) / 3;
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      
      if (brightness > 235 && colorVariance < 20) {
        // Check if adjacent to removed area (likely a halo)
        const neighbors = [
          idx - 1, idx + 1,
          idx - width, idx + width,
          idx - width - 1, idx - width + 1,
          idx + width - 1, idx + width + 1
        ];
        
        let adjacentToRemoved = false;
        for (const nIdx of neighbors) {
          if (nIdx >= 0 && nIdx < mask.length && mask[nIdx] === 0) {
            adjacentToRemoved = true;
            break;
          }
        }
        
        if (adjacentToRemoved) {
          expanded[idx] = 0; // Remove the halo
        }
      }
    }
  }
  
  return expanded;
}

// Pass 2.5: Detect and remove enclosed white spaces (like trigger guards)
function detectEnclosedSpaces(mask: Float32Array, data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const enhanced = new Float32Array(mask);
  
  // Find white regions that are completely enclosed by design elements
  const visited = new Set<number>();
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Skip if already processed or marked for removal
      if (visited.has(idx) || mask[idx] === 0) continue;
      
      const dataIdx = idx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      const brightness = (r + g + b) / 3;
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      
      // Look for very bright pixels that are definitely background spaces
      if (brightness > 245 && colorVariance < 15) {
        const region = new Set<number>();
        const stack = [idx];
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let touchesEdges = false;
        
        // Region growing to find connected white area
        while (stack.length > 0) {
          const currentIdx = stack.pop()!;
          if (visited.has(currentIdx)) continue;
          
          visited.add(currentIdx);
          region.add(currentIdx);
          
          const cx = currentIdx % width;
          const cy = Math.floor(currentIdx / width);
          
          // Track bounding box
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
          
          // Check if region touches image edges
          if (cx === 0 || cx === width - 1 || cy === 0 || cy === height - 1) {
            touchesEdges = true;
          }
          
          // Expand to similar white pixels
          const neighbors = [
            currentIdx - 1, currentIdx + 1,
            currentIdx - width, currentIdx + width
          ];
          
          for (const nIdx of neighbors) {
            if (nIdx < 0 || nIdx >= mask.length || visited.has(nIdx)) continue;
            
            const nDataIdx = nIdx * 4;
            const nR = data[nDataIdx];
            const nG = data[nDataIdx + 1];
            const nB = data[nDataIdx + 2];
            const nBrightness = (nR + nG + nB) / 3;
            const nColorVariance = Math.abs(nR - nG) + Math.abs(nG - nB) + Math.abs(nR - nB);
            
            // Add to region if it's also bright and low variance
            if (nBrightness > 230 && nColorVariance < 30 && mask[nIdx] > 0) {
              stack.push(nIdx);
            }
          }
        }
        
        // Check if this region is enclosed (small and doesn't touch edges)
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        const isSmallRegion = region.size < 2000;
        const hasReasonableAspectRatio = (
          regionWidth / regionHeight > 0.2 && regionWidth / regionHeight < 5
        );
        
        if (!touchesEdges && isSmallRegion && hasReasonableAspectRatio) {
          // Check if surrounded by design elements (non-white pixels)
          let surroundingDesignPixels = 0;
          let totalSurrounding = 0;
          
          // Check perimeter around the region
          for (let ry = Math.max(0, minY - 2); ry <= Math.min(height - 1, maxY + 2); ry++) {
            for (let rx = Math.max(0, minX - 2); rx <= Math.min(width - 1, maxX + 2); rx++) {
              const checkIdx = ry * width + rx;
              
              // Skip if it's part of the region itself
              if (region.has(checkIdx)) continue;
              
              totalSurrounding++;
              const checkDataIdx = checkIdx * 4;
              const checkBrightness = (
                data[checkDataIdx] + data[checkDataIdx + 1] + data[checkDataIdx + 2]
              ) / 3;
              const checkVariance = Math.abs(data[checkDataIdx] - data[checkDataIdx + 1]) + 
                                   Math.abs(data[checkDataIdx + 1] - data[checkDataIdx + 2]) + 
                                   Math.abs(data[checkDataIdx] - data[checkDataIdx + 2]);
              
              // Count as design element if it's not white/gray
              if (checkBrightness < 220 || checkVariance > 40) {
                surroundingDesignPixels++;
              }
            }
          }
          
          // Very conservative - only remove if strongly surrounded by design AND very small
          const stronglySurrounded = surroundingDesignPixels > totalSurrounding * 0.7;
          const verySmall = region.size < 500;
          
          if (stronglySurrounded && verySmall) {
            for (const rIdx of region) {
              enhanced[rIdx] = 0;
            }
          }
        }
      }
    }
  }
  
  return enhanced;
}

// Pass 3: Aggressively clean up internal white spaces and shadows
function cleanupInternalWhite(mask: Float32Array, data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const cleaned = new Float32Array(mask);
  
  // Multiple passes for thorough cleanup
  
  // First pass: Remove any white/light gray that's not part of the main design
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Skip if already marked for removal
      if (mask[idx] === 0) continue;
      
      const dataIdx = idx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      
      // Check for white, near-white, and light gray (shadows)
      const brightness = (r + g + b) / 3;
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      
      // Only target pure white/very light gray that's clearly background
      if (brightness > 230 && colorVariance < 25) {
        // Check if this white area is surrounded by design elements (enclosed)
        let designElementsNearby = 0;
        let backgroundRemoved = 0;
        let totalChecked = 0;
        
        // Check in 5x5 area for context
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (Math.abs(dx) + Math.abs(dy) === 0) continue;
            
            const nIdx = (y + dy) * width + (x + dx);
            if (nIdx >= 0 && nIdx < mask.length) {
              totalChecked++;
              
              // Check if this neighbor was already removed (background)
              if (mask[nIdx] === 0) {
                backgroundRemoved++;
                continue;
              }
              
              const nDataIdx = nIdx * 4;
              const nR = data[nDataIdx];
              const nG = data[nDataIdx + 1];
              const nB = data[nDataIdx + 2];
              const nBrightness = (nR + nG + nB) / 3;
              const nColorVariance = Math.abs(nR - nG) + Math.abs(nG - nB) + Math.abs(nR - nB);
              
              // This is a colorful design element (not white/gray)
              if (nBrightness < 200 || nColorVariance > 60) {
                designElementsNearby++;
              }
            }
          }
        }
        
        // Only remove if:
        // 1. Mostly surrounded by already removed background, OR
        // 2. Touching background areas from above/below (like between legs)
        const surroundedByBackground = backgroundRemoved > totalChecked * 0.5;
        const touchingVerticalBackground = (
          mask[idx - width] === 0 || mask[idx + width] === 0
        ) && designElementsNearby > 3;
        
        if (surroundedByBackground || touchingVerticalBackground) {
          cleaned[idx] = 0;
        }
      }
    }
  }
  
  // Second pass: Region growing to catch connected white/gray areas
  const visited = new Set<number>();
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      if (cleaned[idx] === 0 || visited.has(idx)) continue;
      
      const dataIdx = idx * 4;
      const brightness = (data[dataIdx] + data[dataIdx + 1] + data[dataIdx + 2]) / 3;
      
      // Start region growing from very bright pixels only
      if (brightness > 240) {
        const region = new Set<number>();
        const stack = [idx];
        let hasBackgroundConnection = false;
        let touchesDesignBorder = false;
        
        while (stack.length > 0) {
          const currentIdx = stack.pop()!;
          if (visited.has(currentIdx)) continue;
          
          visited.add(currentIdx);
          region.add(currentIdx);
          
          const cx = currentIdx % width;
          const cy = Math.floor(currentIdx / width);
          
          // Check if this region connects to already removed background
          if (cleaned[currentIdx] === 0) {
            hasBackgroundConnection = true;
          }
          
          // Check 4-connected neighbors
          const neighbors = [
            currentIdx - 1, currentIdx + 1,
            currentIdx - width, currentIdx + width
          ];
          
          for (const nIdx of neighbors) {
            if (nIdx < 0 || nIdx >= mask.length) continue;
            
            const nDataIdx = nIdx * 4;
            const nR = data[nDataIdx];
            const nG = data[nDataIdx + 1];
            const nB = data[nDataIdx + 2];
            const nBrightness = (nR + nG + nB) / 3;
            const nColorVariance = Math.abs(nR - nG) + Math.abs(nG - nB) + Math.abs(nR - nB);
            
            // Check if neighbor connects to background
            if (cleaned[nIdx] === 0) {
              hasBackgroundConnection = true;
            }
            
            // Check if we're at the border of a design element
            if (nColorVariance > 80 || nBrightness < 150) {
              touchesDesignBorder = true;
            }
            
            // Only add very similar white pixels to region
            if (nBrightness > 235 && nColorVariance < 30 && !visited.has(nIdx)) {
              stack.push(nIdx);
            }
          }
        }
        
        // Only remove if region connects to background AND is small
        // Don't remove if it's a large central design element
        const isSmallTrappedRegion = region.size < 5000;
        const isBackgroundConnected = hasBackgroundConnection;
        const isNotCentralDesign = touchesDesignBorder || region.size < 1000;
        
        if (isBackgroundConnected && isSmallTrappedRegion && isNotCentralDesign) {
          for (const rIdx of region) {
            cleaned[rIdx] = 0;
          }
        }
      }
    }
  }
  
  // Third pass: Clean up any remaining isolated white pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      if (cleaned[idx] === 0) continue;
      
      const dataIdx = idx * 4;
      const brightness = (data[dataIdx] + data[dataIdx + 1] + data[dataIdx + 2]) / 3;
      
      if (brightness > 240) {
        // Count removed neighbors
        let removedNeighbors = 0;
        const neighbors = [
          idx - 1, idx + 1,
          idx - width, idx + width,
          idx - width - 1, idx - width + 1,
          idx + width - 1, idx + width + 1
        ];
        
        for (const nIdx of neighbors) {
          if (nIdx >= 0 && nIdx < cleaned.length && cleaned[nIdx] === 0) {
            removedNeighbors++;
          }
        }
        
        // If mostly surrounded by removed pixels, remove this one too
        if (removedNeighbors >= 4) {
          cleaned[idx] = 0;
        }
      }
    }
  }
  
  return cleaned;
}

// Pass 4: Professional edge smoothing with sub-pixel precision
function smoothMaskEdges(mask: Float32Array, width: number, height: number): Float32Array {
  const smoothed = new Float32Array(mask);
  
  // First, detect all edge pixels
  const edgePixels = new Set<number>();
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Check 8-connected neighbors for edge detection
      const neighbors = [
        mask[idx - 1], mask[idx + 1],
        mask[idx - width], mask[idx + width],
        mask[idx - width - 1], mask[idx - width + 1],
        mask[idx + width - 1], mask[idx + width + 1]
      ];
      
      let hasTransition = false;
      for (const n of neighbors) {
        if (Math.abs(n - mask[idx]) > 0.1) {
          hasTransition = true;
          break;
        }
      }
      
      if (hasTransition) {
        edgePixels.add(idx);
      }
    }
  }
  
  // Apply sophisticated smoothing only to edge pixels
  for (const idx of edgePixels) {
    const x = idx % width;
    const y = Math.floor(idx / width);
    
    // Use a weighted kernel for better edge quality
    const weights = [
      0.05, 0.1, 0.05,  // Top row
      0.1,  0.4, 0.1,   // Middle row (center has highest weight)
      0.05, 0.1, 0.05   // Bottom row
    ];
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          const weight = weights[(dy + 1) * 3 + (dx + 1)];
          weightedSum += mask[nIdx] * weight;
          totalWeight += weight;
        }
      }
    }
    
    if (totalWeight > 0) {
      smoothed[idx] = weightedSum / totalWeight;
    }
  }
  
  // Second pass: Apply subtle feathering for ultra-smooth edges
  const feathered = new Float32Array(smoothed);
  
  for (const idx of edgePixels) {
    const x = idx % width;
    const y = Math.floor(idx / width);
    
    // Sample in a small radius for feathering
    let sum = 0;
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const weight = distance === 0 ? 1 : 1 / distance;
          sum += smoothed[nIdx] * weight;
          count += weight;
        }
      }
    }
    
    if (count > 0) {
      feathered[idx] = sum / count;
    }
  }
  
  return feathered;
}

// Apply final mask with BGBye-style normalization and advanced blending
function applyFinalMask(data: Uint8ClampedArray, mask: Float32Array): void {
  // BGBye-style min-max normalization for consistent quality
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
  
  // Multi-scale alpha blending inspired by BGBye's FBA matting
  for (let i = 0; i < mask.length; i++) {
    const dataIdx = i * 4;
    const originalAlpha = data[dataIdx + 3];
    
    let maskValue = mask[i];
    
    // Advanced smooth transition (sigmoid-like)
    if (maskValue < 1) {
      // Trimap-inspired blending: definite foreground, uncertain region, definite background
      if (maskValue > 0.8) {
        // Definite foreground - preserve with minimal processing
        maskValue = 0.9 + maskValue * 0.1; // Scale 0.8-1 to 0.9-1
      } else if (maskValue > 0.2) {
        // Uncertain region - apply sophisticated blending
        const t = (maskValue - 0.2) / 0.6; // Normalize to 0-1
        // Use smoothstep function for natural falloff
        maskValue = t * t * (3 - 2 * t);
      } else {
        // Definite background - strong removal
        maskValue = maskValue * maskValue; // Quadratic falloff for background
      }
    }
    
    // Apply mask with alpha preservation
    data[dataIdx + 3] = Math.round(originalAlpha * maskValue);
  }
}

// BGBye-inspired bilinear upsampling for smooth edges
function bilinearUpsample(mask: Float32Array, width: number, height: number, targetWidth: number, targetHeight: number): Float32Array {
  if (width === targetWidth && height === targetHeight) return mask;
  
  const result = new Float32Array(targetWidth * targetHeight);
  const xRatio = width / targetWidth;
  const yRatio = height / targetHeight;
  
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, width - 1);
      const y2 = Math.min(y1 + 1, height - 1);
      
      const dx = srcX - x1;
      const dy = srcY - y1;
      
      // Bilinear interpolation
      const val11 = mask[y1 * width + x1];
      const val12 = mask[y2 * width + x1];
      const val21 = mask[y1 * width + x2];
      const val22 = mask[y2 * width + x2];
      
      const val1 = val11 * (1 - dx) + val21 * dx;
      const val2 = val12 * (1 - dx) + val22 * dx;
      const finalVal = val1 * (1 - dy) + val2 * dy;
      
      result[y * targetWidth + x] = finalVal;
    }
  }
  
  return result;
}

// Legacy function kept for compatibility
function createInitialMask(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const mask = new Float32Array(width * height);
  const visited = new Set<number>();
  const toRemove = new Set<number>();
  
  // For CSHRTX images, we expect a pure white background
  const TARGET_WHITE = { r: 255, g: 255, b: 255 };
  
  // Very strict color matching for white backgrounds
  const isWhiteBackground = (r: number, g: number, b: number) => {
    // Only remove very pure white pixels (tolerance of 5 for each channel)
    const tolerance = 5;
    return (
      r >= TARGET_WHITE.r - tolerance &&
      g >= TARGET_WHITE.g - tolerance &&
      b >= TARGET_WHITE.b - tolerance &&
      // Also check that it's not a light color (all channels should be high)
      Math.min(r, g, b) >= 250
    );
  };
  
  const getIndex = (x: number, y: number) => y * width + x;
  
  // Conservative flood fill - only removes continuous pure white areas
  const floodFill = (startX: number, startY: number) => {
    const stack = [{ x: startX, y: startY }];
    
    // Check if starting pixel is pure white
    const startIdx = getIndex(startX, startY) * 4;
    if (!isWhiteBackground(data[startIdx], data[startIdx + 1], data[startIdx + 2])) {
      return; // Don't flood fill from non-white pixels
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
      const a = data[dataIndex + 3];
      
      // Only remove if it's pure white AND fully opaque
      if (isWhiteBackground(r, g, b) && a > 250) {
        toRemove.add(pixelIndex);
        // Add neighboring pixels - only direct neighbors for strict flood fill
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
  
  // Second pass: Clean up isolated white pixels that are completely surrounded by transparency
  // This helps remove white spots trapped in transparent areas
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = getIndex(x, y);
      
      // Skip if already marked for removal
      if (toRemove.has(idx)) continue;
      
      const dataIdx = idx * 4;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];
      
      // Check if this is a white pixel
      if (isWhiteBackground(r, g, b)) {
        // Check if surrounded by removed pixels
        const neighbors = [
          getIndex(x - 1, y),
          getIndex(x + 1, y),
          getIndex(x, y - 1),
          getIndex(x, y + 1)
        ];
        
        const surroundedByRemoved = neighbors.every(nIdx => toRemove.has(nIdx));
        if (surroundedByRemoved) {
          toRemove.add(idx);
        }
      }
    }
  }
  
  // Create mask (1 = keep, 0 = remove)
  mask.fill(1);
  for (const pixelIndex of toRemove) {
    mask[pixelIndex] = 0;
  }
  
  return mask;
}

// Pass 2: Edge-aware refinement using gradient information (conservative)
function refineEdges(mask: Float32Array, data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const refined = new Float32Array(mask.length);
  
  // Copy original mask first
  for (let i = 0; i < mask.length; i++) {
    refined[i] = mask[i];
  }
  
  // Sobel edge detection kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const centerIdx = y * width + x;
      
      // Only refine edges at the boundary between mask and non-mask
      if (mask[centerIdx] === 0 || mask[centerIdx] === 1) {
        // Check if we're at a boundary
        let isBoundary = false;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const neighborIdx = (y + ky) * width + (x + kx);
            if (mask[neighborIdx] !== mask[centerIdx]) {
              isBoundary = true;
              break;
            }
          }
          if (isBoundary) break;
        }
        
        if (isBoundary) {
          // Calculate gradient magnitude only at boundaries
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
          
          // Very conservative edge refinement - only blend slightly
          if (gradient > 50) { // Higher threshold
            const blendFactor = Math.min(0.3, gradient / 500); // Much less aggressive
            refined[centerIdx] = mask[centerIdx] * (1 - blendFactor);
          }
        }
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
