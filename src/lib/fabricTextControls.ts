
import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Track hover states for controls
let hoveredControl: string | null = null;

// Add mouse event listeners for hover effects
function addHoverListeners(canvas: any) {
  canvas.on('mouse:move', (options: any) => {
    const pointer = canvas.getPointer(options.e);
    const activeObject = canvas.getActiveObject();
    
    if (activeObject) {
      // Check which control is being hovered - using correct v6 method
      let control = null;
      try {
        // Use the correct method for Fabric.js v6
        control = activeObject.findControl(pointer) || null;
      } catch (e) {
        // Fallback if method doesn't exist
        control = null;
      }
      
      if (control !== hoveredControl) {
        hoveredControl = control;
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw trash icon in purple (or white when hovered)
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.fillStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Trash can lid
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(4, -4);
        ctx.stroke();
        
        // Trash can body
        ctx.beginPath();
        ctx.rect(-3, -2, 6, 6);
        ctx.stroke();
        
        // Vertical lines inside
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.lineTo(-1, 3);
        ctx.moveTo(1, 0);
        ctx.lineTo(1, 3);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw the rotate icon in purple (or white when hovered)
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw circular arrow (refresh/rotate icon)
        ctx.beginPath();
        ctx.arc(0, 0, 4, -Math.PI/2, Math.PI, false);
        ctx.stroke();
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(-2, 4);
        ctx.lineTo(-4, 2.5);
        ctx.lineTo(-1, 2.5);
        ctx.closePath();
        ctx.fillStyle = isHovered ? 'white' : '#8138ff';
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw diagonal resize arrows (scale icon)
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Main diagonal line
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(4, 4);
        ctx.stroke();
        
        // Arrow heads - exact RushOrderTees style
        ctx.beginPath();
        // Top-left arrow
        ctx.moveTo(-4, -4);
        ctx.lineTo(-2, -4);
        ctx.moveTo(-4, -4);
        ctx.lineTo(-4, -2);
        
        // Bottom-right arrow  
        ctx.moveTo(4, 4);
        ctx.lineTo(2, 4);
        ctx.moveTo(4, 4);
        ctx.lineTo(4, 2);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw horizontal stretch arrows
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Main horizontal line
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        
        // Arrow heads - RushOrderTees style
        ctx.beginPath();
        // Left arrow
        ctx.moveTo(-5, 0);
        ctx.lineTo(-2.5, -2);
        ctx.moveTo(-5, 0);
        ctx.lineTo(-2.5, 2);
        
        // Right arrow
        ctx.moveTo(5, 0);
        ctx.lineTo(2.5, -2);
        ctx.moveTo(5, 0);
        ctx.lineTo(2.5, 2);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw vertical stretch arrows
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Main vertical line
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        
        // Arrow heads - RushOrderTees style
        ctx.beginPath();
        // Top arrow
        ctx.moveTo(0, -5);
        ctx.lineTo(-2, -2.5);
        ctx.moveTo(0, -5);
        ctx.lineTo(2, -2.5);
        
        // Bottom arrow
        ctx.moveTo(0, 5);
        ctx.lineTo(-2, 2.5);
        ctx.moveTo(0, 5);
        ctx.lineTo(2, 2.5);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
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
        const size = 24; // Match RushOrderTees size
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
        
        // Draw layers icon (stacked rectangles)
        ctx.strokeStyle = isHovered ? 'white' : '#8138ff';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw three stacked rectangles to represent layers
        // Bottom layer
        ctx.beginPath();
        ctx.rect(-4, 1, 8, 3);
        ctx.stroke();
        
        // Middle layer
        ctx.beginPath();
        ctx.rect(-3, -1, 6, 3);
        ctx.stroke();
        
        // Top layer
        ctx.beginPath();
        ctx.rect(-2, -3, 4, 3);
        ctx.stroke();
        
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
