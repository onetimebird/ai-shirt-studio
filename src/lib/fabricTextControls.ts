
import { Control, controlsUtils, Transform } from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// SVG icon cache for performance
const svgIconCache = new Map<string, HTMLImageElement>();

// Function to load and render SVG with color overlay
async function renderSVGIcon(ctx: CanvasRenderingContext2D, svgPath: string, color: string, size: number = 16): Promise<void> {
  return new Promise((resolve) => {
    const cacheKey = `${svgPath}_${color}`;
    
    if (svgIconCache.has(cacheKey)) {
      const img = svgIconCache.get(cacheKey)!;
      ctx.drawImage(img, -size/2, -size/2, size, size);
      resolve();
      return;
    }

    // Load SVG and create colored version
    fetch(svgPath)
      .then(response => response.text())
      .then(svgText => {
        // Replace both stroke and fill colors to match our theme
        // Handle various black color formats and gray strokes from your SVGs
        const coloredSvg = svgText
          .replace(/stroke="#808080"/g, `stroke="${color}"`)
          .replace(/stroke="#838484"/g, `stroke="${color}"`)  // For RotateIcon.svg
          .replace(/fill="#000000"/g, `fill="${color}"`)
          .replace(/fill="#060808"/g, `fill="${color}"`)      // For RotateIcon.svg dark fill
          .replace(/fill="#ffffff"/g, 'fill="none"');          // Remove white backgrounds
        
        const blob = new Blob([coloredSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          svgIconCache.set(cacheKey, img);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          console.warn('Failed to load SVG:', svgPath);
          resolve();
        };
        img.src = url;
      })
      .catch(() => {
        console.warn('Failed to fetch SVG:', svgPath);
        resolve();
      });
  });
}

// Track hover states for controls
let hoveredControl: string | null = null;

// Add mouse event listeners for hover effects (instant like RushOrderTees)
function addHoverListeners(canvas: any) {
  // More frequent updates for instant responsiveness
  canvas.on('mouse:move', (options: any) => {
    const pointer = canvas.getPointer(options.e);
    const activeObject = canvas.getActiveObject();
    
    if (activeObject && activeObject.controls) {
      let newHoveredControl = null;
      
      // Check each control position manually for more reliable hover detection
      const controls = activeObject.controls;
      const objectBounds = activeObject.getBoundingRect();
      
      // Define control positions relative to object bounds (smaller, more accurate)
      const controlRadius = 12; // Half the visual size (24px controls = 12px radius) 
      const offset = 14; // Smaller distance from object edge for tighter layout
      
      const controlPositions = {
        'tl': { 
          x: objectBounds.left - offset, 
          y: objectBounds.top - offset,
          radius: controlRadius 
        },
        'tr': { 
          x: objectBounds.left + objectBounds.width + offset, 
          y: objectBounds.top - offset,
          radius: controlRadius
        },
        'br': { 
          x: objectBounds.left + objectBounds.width + offset, 
          y: objectBounds.top + objectBounds.height + offset,
          radius: controlRadius
        },
        'bl': { 
          x: objectBounds.left - offset, 
          y: objectBounds.top + objectBounds.height + offset,
          radius: controlRadius
        },
        'mr': { 
          x: objectBounds.left + objectBounds.width + offset, 
          y: objectBounds.top + objectBounds.height / 2,
          radius: controlRadius
        },
        'mb': { 
          x: objectBounds.left + objectBounds.width / 2, 
          y: objectBounds.top + objectBounds.height + offset,
          radius: controlRadius
        }
      };
      
      // Check if pointer is within any control circle - instant detection
      for (const [controlKey, position] of Object.entries(controlPositions)) {
        if (controls[controlKey] && controls[controlKey].visible !== false) {
          const distance = Math.sqrt(
            Math.pow(pointer.x - position.x, 2) + 
            Math.pow(pointer.y - position.y, 2)
          );
          
          // Entire control circle responsive - instant like RushOrderTees
          if (distance <= position.radius) {
            newHoveredControl = controlKey;
            break;
          }
        }
      }
      
      // Immediate update on hover change - no delay
      if (newHoveredControl !== hoveredControl) {
        hoveredControl = newHoveredControl;
        canvas.renderAll();
      }
    } else if (hoveredControl) {
      hoveredControl = null;
      canvas.renderAll();
    }
  });
  
  // Also listen to mouse enter/leave for extra responsiveness
  canvas.on('mouse:over', () => {
    canvas.renderAll();
  });
  
  canvas.on('mouse:out', () => {
    if (hoveredControl) {
      hoveredControl = null;
      canvas.renderAll();
    }
  });
}

// Create custom controls that match RushOrderTees style with shimmer hover effects
export function initializeTextControls() {
  console.log('🔧 initializeTextControls called - creating ROT-style controls with shimmer...');
  
  try {
    // Create delete control - TOP LEFT position like RushOrderTees
    const deleteControl = new Control({
      x: -0.5,
      y: -0.5,
      offsetX: -8,
      offsetY: -8,
      cursorStyleHandler: () => 'pointer',
      actionHandler: (eventData: MouseEvent, transform: Transform) => {
        const target = transform.target;
        const canvas = target.canvas;
        if (canvas && target) {
          canvas.remove(target);
          canvas.requestRenderAll();
        }
        return true;
      },
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'tl';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG trash icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/TrashCan.svg', iconColor, 18).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create rotation control - TOP RIGHT position like RushOrderTees
    const rotateControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetX: 8,
      offsetY: -8,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: controlsUtils.rotationWithSnapping,
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'tr';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG rotate icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/RotateIcon.svg', iconColor, 16).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create uniform scale control - BOTTOM RIGHT position like RushOrderTees
    const scaleControl = new Control({
      x: 0.5,
      y: 0.5,
      offsetX: 8,
      offsetY: 8,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: controlsUtils.scalingEqually,
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'br';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG scale icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/ScaleIcon.svg', iconColor, 18).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create horizontal stretch control - MIDDLE RIGHT position like RushOrderTees
    const stretchHorizontalControl = new Control({
      x: 0.5,
      y: 0, // Middle right
      offsetX: 8,
      offsetY: 0,
      cursorStyleHandler: () => 'ew-resize',
      actionHandler: controlsUtils.scalingX,
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'mr';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG horizontal stretch icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/StretchHorizontal.svg', iconColor, 16).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create vertical stretch control - MIDDLE BOTTOM position like RushOrderTees
    const stretchVerticalControl = new Control({
      x: 0,
      y: 0.5, // Position at bottom edge
      offsetX: 0,
      offsetY: 8, // Positive offset to move down from bottom
      cursorStyleHandler: () => 'ns-resize',
      actionHandler: controlsUtils.scalingY,
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'mb';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG vertical stretch icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/StrechVertical.svg', iconColor, 16).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create layer control - BOTTOM LEFT position like RushOrderTees (from your screenshot)
    const layerControl = new Control({
      x: -0.5,
      y: 0.5,
      offsetX: -8,
      offsetY: 8,
      cursorStyleHandler: () => 'pointer',
      actionHandler: () => {
        // This could trigger a layer menu - for now just a placeholder
        console.log('Layer control clicked');
        return true;
      },
      render: (ctx, left, top) => {
        const size = 20; // Match RushOrderTees size
        ctx.save();
        ctx.translate(left, top);
        
        // White background circle
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Purple border with hover effect
        const isHovered = hoveredControl === 'bl';
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw your clean SVG layers icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        renderSVGIcon(ctx, '/src/assets/icons/LayersIcon.svg', iconColor, 18).catch(console.warn);
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Apply controls to fabric objects - EXACT RushOrderTees positioning
    const customControls = {
      tl: deleteControl,         // Delete (trash) on top-left - EXACTLY like RushOrderTees
      tr: rotateControl,         // Rotate on top-right - EXACTLY like RushOrderTees
      mb: stretchVerticalControl, // Vertical stretch on bottom - EXACTLY like RushOrderTees
      mr: stretchHorizontalControl, // Horizontal stretch on right - EXACTLY like RushOrderTees  
      br: scaleControl,          // Scale on bottom-right - EXACTLY like RushOrderTees
      bl: layerControl,          // Layer control on bottom-left - EXACTLY like RushOrderTees
      // Hide default controls we don't want
      ml: new Control({ visible: false }),
      mt: new Control({ visible: false }),
      mtr: new Control({ visible: false }),
    };
    
    // Store controls globally for use
    (window as any).customFabricControls = customControls;
    
    console.log('✅ ROT-style controls created and stored globally');
    
  } catch (error) {
    console.error('❌ Failed to create controls:', error);
  }
  
  return Promise.resolve();
}

// Function to apply controls to objects
export function applyCustomControlsToObject(obj: any) {
  console.log('🎯 Applying ROT-style controls to:', obj.type);
  const customControls = (window as any).customFabricControls;
  if (customControls && obj) {
    obj.controls = customControls;
    
    // Set up hover listeners if not already done
    const canvas = obj.canvas;
    if (canvas && !(canvas as any).hasHoverListeners) {
      addHoverListeners(canvas);
      (canvas as any).hasHoverListeners = true;
    }
    
    // Ensure rotation happens from center
    obj.set('originX', 'center');
    obj.set('originY', 'center');
    obj.set('centeredRotation', true);
    
    // Apply dotted border styling
    obj.borderColor = '#8138ff'; // Purple color to match icons
    obj.borderDashArray = [3, 3]; // Finer dotted line pattern
    obj.borderScaleFactor = 2; // Make border slightly thicker
    obj.cornerColor = 'transparent'; // Hide corner squares
    obj.cornerSize = 0; // Remove corner size
    obj.transparentCorners = true;
    obj.borderOpacityWhenMoving = 0.8;
    
    console.log('✅ ROT-style controls and dotted border applied to object');
  }
}
