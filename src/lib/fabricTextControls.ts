
import * as fabric from "fabric";

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
        // Replace stroke colors in SVG to match our theme
        const coloredSvg = svgText
          .replace(/stroke="#808080"/g, `stroke="${color}"`)
          .replace(/fill="#000000"/g, `fill="${color}"`);
        
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

// Add mouse event listeners for hover effects
function addHoverListeners(canvas: any) {
  canvas.on('mouse:move', (options: any) => {
    const pointer = canvas.getPointer(options.e);
    const activeObject = canvas.getActiveObject();
    
    if (activeObject && activeObject.controls) {
      let newHoveredControl = null;
      
      // Check each control position manually for more reliable hover detection
      const controls = activeObject.controls;
      const objectBounds = activeObject.getBoundingRect();
      const zoom = canvas.getZoom();
      
      // Get object transform matrix for accurate control positioning
      const transform = activeObject.calcTransformMatrix();
      const objectCenter = { 
        x: objectBounds.left + objectBounds.width / 2, 
        y: objectBounds.top + objectBounds.height / 2 
      };
      
      // Define control positions relative to object bounds (more accurate)
      const controlRadius = 20; // Half the visual size (40px controls = 20px radius) 
      const offset = 24; // Distance from object edge
      
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
      
      // Check if pointer is within any control circle (entire white circle is clickable)
      for (const [controlKey, position] of Object.entries(controlPositions)) {
        if (controls[controlKey] && controls[controlKey].visible !== false) {
          const distance = Math.sqrt(
            Math.pow(pointer.x - position.x, 2) + 
            Math.pow(pointer.y - position.y, 2)
          );
          
          // Make entire control circle responsive (16px radius)
          if (distance <= position.radius) {
            newHoveredControl = controlKey;
            break;
          }
        }
      }
      
      if (newHoveredControl !== hoveredControl) {
        hoveredControl = newHoveredControl;
        canvas.renderAll();
      }
    } else if (hoveredControl) {
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
    const deleteControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -8,
      offsetY: -8,
      cursorStyleHandler: () => 'pointer',
      actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
        const target = transform.target;
        const canvas = target.canvas;
        if (canvas && target) {
          canvas.remove(target);
          canvas.requestRenderAll();
        }
        return true;
      },
      render: (ctx, left, top) => {
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
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
      sizeX: 40,
      sizeY: 40,
    });

    // Create rotation control - TOP RIGHT position like RushOrderTees
    const rotateControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 8,
      offsetY: -8,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: (ctx, left, top) => {
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw cleaner rotate icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.fillStyle = iconColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw circular arrow (more complete circle)
        ctx.beginPath();
        ctx.arc(0, 0, 5, -Math.PI/4, Math.PI * 7/4, false);
        ctx.stroke();
        
        // Draw clearer arrow head
        ctx.beginPath();
        ctx.moveTo(3.5, -3.5);
        ctx.lineTo(6, -2);
        ctx.lineTo(5, -5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 40,
      sizeY: 40,
    });

    // Create uniform scale control - BOTTOM RIGHT position like RushOrderTees
    const scaleControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 8,
      offsetY: 8,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: (ctx, left, top) => {
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
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
      sizeX: 40,
      sizeY: 40,
    });

    // Create horizontal stretch control - MIDDLE RIGHT position like RushOrderTees
    const stretchHorizontalControl = new fabric.Control({
      x: 0.5,
      y: 0, // Middle right
      offsetX: 8,
      offsetY: 0,
      cursorStyleHandler: () => 'ew-resize',
      actionHandler: fabric.controlsUtils.scalingX,
      render: (ctx, left, top) => {
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw cleaner horizontal stretch arrows
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.fillStyle = iconColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        
        // Left arrow head
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-3, -2.5);
        ctx.lineTo(-3, 2.5);
        ctx.closePath();
        ctx.fill();
        
        // Right arrow head
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(3, -2.5);
        ctx.lineTo(3, 2.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 40,
      sizeY: 40,
    });

    // Create vertical stretch control - MIDDLE BOTTOM position like RushOrderTees
    const stretchVerticalControl = new fabric.Control({
      x: 0,
      y: 0.5, // Position at bottom edge
      offsetX: 0,
      offsetY: 8, // Positive offset to move down from bottom
      cursorStyleHandler: () => 'ns-resize',
      actionHandler: fabric.controlsUtils.scalingY,
      render: (ctx, left, top) => {
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Purple background on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(0, 0, size/2 - 1, 0, 2 * Math.PI);
          ctx.fillStyle = '#8138ff';
          ctx.fill();
        }
        
        // Draw cleaner vertical stretch arrows
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.fillStyle = iconColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.stroke();
        
        // Top arrow head
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-2.5, -3);
        ctx.lineTo(2.5, -3);
        ctx.closePath();
        ctx.fill();
        
        // Bottom arrow head
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(-2.5, 3);
        ctx.lineTo(2.5, 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 40,
      sizeY: 40,
    });

    // Create layer control - BOTTOM LEFT position like RushOrderTees (from your screenshot)
    const layerControl = new fabric.Control({
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
        const size = 32; // Larger for easier clicking
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
        ctx.lineWidth = 2;
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
      sizeX: 40,
      sizeY: 40,
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
      ml: new fabric.Control({ visible: false }),
      mt: new fabric.Control({ visible: false }),
      mtr: new fabric.Control({ visible: false }),
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
export function applyCustomControlsToObject(obj: fabric.Object) {
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
