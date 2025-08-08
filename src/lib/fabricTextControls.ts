
import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Clean vector-based icon rendering functions
function drawTrashIcon(ctx: CanvasRenderingContext2D, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Trash can lid
  ctx.beginPath();
  ctx.rect(-6, -7, 12, 1.5);
  ctx.fill();
  
  // Lid handles
  ctx.beginPath();
  ctx.rect(-3, -8, 1, 2);
  ctx.rect(2, -8, 1, 2);
  ctx.fill();
  
  // Trash can body
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-4, 6);
  ctx.lineTo(4, 6);
  ctx.lineTo(5, -5);
  ctx.closePath();
  ctx.stroke();
  
  // Vertical lines inside
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.lineTo(-1.5, 4);
  ctx.moveTo(0, -3);
  ctx.lineTo(0, 4);
  ctx.moveTo(2, -3);
  ctx.lineTo(1.5, 4);
  ctx.stroke();
}

function drawScaleIcon(ctx: CanvasRenderingContext2D, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Top-left arrow
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-3, -6);
  ctx.moveTo(-6, -6);
  ctx.lineTo(-6, -3);
  ctx.stroke();
  
  // Diagonal line from top-left to bottom-right
  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(4, 4);
  ctx.stroke();
  
  // Bottom-right arrow
  ctx.beginPath();
  ctx.moveTo(6, 6);
  ctx.lineTo(3, 6);
  ctx.moveTo(6, 6);
  ctx.lineTo(6, 3);
  ctx.stroke();
}

function drawLayersIcon(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  // Draw three stacked diamond/hexagon shapes
  // Top layer
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(4, -4);
  ctx.lineTo(4, -2);
  ctx.lineTo(0, -4);
  ctx.lineTo(-4, -2);
  ctx.lineTo(-4, -4);
  ctx.closePath();
  ctx.fill();
  
  // Middle layer
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(5, 0);
  ctx.lineTo(5, 2);
  ctx.lineTo(0, 0);
  ctx.lineTo(-5, 2);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.fill();
  
  // Bottom layer
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(6, 4);
  ctx.lineTo(6, 6);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 6);
  ctx.lineTo(-6, 4);
  ctx.closePath();
  ctx.fill();
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
      
      // Define control positions based on object bounds
      const controlPositions = {
        'tl': { x: objectBounds.left - 24, y: objectBounds.top - 24 },
        'tr': { x: objectBounds.left + objectBounds.width + 24, y: objectBounds.top - 24 },
        'br': { x: objectBounds.left + objectBounds.width + 24, y: objectBounds.top + objectBounds.height + 24 },
        'bl': { x: objectBounds.left - 24, y: objectBounds.top + objectBounds.height + 24 },
        'mr': { x: objectBounds.left + objectBounds.width + 24, y: objectBounds.top + objectBounds.height / 2 },
        'mb': { x: objectBounds.left + objectBounds.width / 2, y: objectBounds.top + objectBounds.height + 24 }
      };
      
      // Check if pointer is within any control area (larger click area)
      for (const [controlKey, position] of Object.entries(controlPositions)) {
        if (controls[controlKey] && controls[controlKey].visible !== false) {
          const distance = Math.sqrt(
            Math.pow(pointer.x - position.x, 2) + 
            Math.pow(pointer.y - position.y, 2)
          );
          
          // Increase hit area to 20px radius for easier clicking
          if (distance <= 20) {
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
        const size = 28; // Larger for easier clicking
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
        
        // Draw clean trash icon using vector function
        const iconColor = isHovered ? 'white' : '#8138ff';
        drawTrashIcon(ctx, iconColor);
        
        ctx.restore();
      },
      sizeX: 32,
      sizeY: 32,
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
        const size = 28; // Larger for easier clicking
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
      sizeX: 32,
      sizeY: 32,
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
        const size = 28; // Larger for easier clicking
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
        
        // Draw clean scale icon using vector function
        const iconColor = isHovered ? 'white' : '#8138ff';
        drawScaleIcon(ctx, iconColor);
        
        ctx.restore();
      },
      sizeX: 32,
      sizeY: 32,
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
        const size = 28; // Larger for easier clicking
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
      sizeX: 32,
      sizeY: 32,
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
        const size = 28; // Larger for easier clicking
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
      sizeX: 32,
      sizeY: 32,
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
        const size = 28; // Larger for easier clicking
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
        
        // Draw clean layers icon using vector function
        const iconColor = isHovered ? 'white' : '#8138ff';
        drawLayersIcon(ctx, iconColor);
        
        ctx.restore();
      },
      sizeX: 32,
      sizeY: 32,
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
