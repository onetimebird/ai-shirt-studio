
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
    // Create delete control with gradient background - positioned top-right
    const deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 8,
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
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // White background with purple on hover
        const isHovered = hoveredControl === 'delete';
        const fillColor = isHovered ? '#8138ff' : 'white';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'rgba(129, 56, 255, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add border
        ctx.strokeStyle = '#8138ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw trash icon with color based on hover state
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.fillStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        
        // Trash can lid
        ctx.beginPath();
        ctx.moveTo(-4, -3);
        ctx.lineTo(4, -3);
        ctx.stroke();
        
        // Trash can body
        ctx.beginPath();
        ctx.moveTo(-3, -1);
        ctx.lineTo(-2.5, 4);
        ctx.lineTo(2.5, 4);
        ctx.lineTo(3, -1);
        ctx.closePath();
        ctx.stroke();
        
        // Vertical lines inside
        ctx.beginPath();
        ctx.moveTo(-1, 1);
        ctx.lineTo(-1, 3);
        ctx.moveTo(1, 1);
        ctx.lineTo(1, 3);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 20,
      sizeY: 20,
    });

    // Create rotation control with uploaded icon - positioned top middle
    const rotateControl = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetX: 0,
      offsetY: -8,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // White background with purple on hover
        const isHovered = hoveredControl === 'rotate';
        const fillColor = isHovered ? '#8138ff' : 'white';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'rgba(129, 56, 255, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add border
        ctx.strokeStyle = '#8138ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw the rotate icon
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.fillStyle = iconColor;
        ctx.shadowColor = 'transparent';
        
        // Create a circular arrow icon similar to the uploaded image
        ctx.lineWidth = 2;
        ctx.strokeStyle = iconColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw main circular arrow
        ctx.beginPath();
        ctx.arc(0, 0, 5, -Math.PI/4, Math.PI * 3/2, false);
        ctx.stroke();
        
        // Draw arrow head at the end
        ctx.beginPath();
        ctx.moveTo(-3.5, -3.5);
        ctx.lineTo(-1, -3.5);
        ctx.lineTo(-2.5, -2);
        ctx.closePath();
        ctx.fillStyle = iconColor;
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 20,
      sizeY: 20,
    });

    // Create uniform scale control with gradient background
    const scaleControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 8,
      offsetY: 8,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // White background with purple on hover
        const isHovered = hoveredControl === 'scale';
        const fillColor = isHovered ? '#8138ff' : 'white';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'rgba(129, 56, 255, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add border
        ctx.strokeStyle = '#8138ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw diagonal double arrow
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        
        // Main diagonal line
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(4, 4);
        ctx.stroke();
        
        // Arrow heads
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
      sizeX: 20,
      sizeY: 20,
    });

    // Create horizontal stretch control aligned with trash can positioning
    const stretchHorizontalControl = new fabric.Control({
      x: 0.5, // Same x position as trash can
      y: 0, // Middle right
      offsetX: 8, // Same offset as trash can
      offsetY: 0,
      cursorStyleHandler: () => 'ew-resize',
      actionHandler: fabric.controlsUtils.scalingX,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // White background with purple on hover
        const isHovered = hoveredControl === 'stretchH';
        const fillColor = isHovered ? '#8138ff' : 'white';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'rgba(129, 56, 255, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add border
        ctx.strokeStyle = '#8138ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw horizontal double arrow
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        
        // Main horizontal line
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        
        // Arrow heads
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
      sizeX: 20,
      sizeY: 20,
    });

    // Create vertical stretch control - positioned on bottom
    const stretchVerticalControl = new fabric.Control({
      x: 0,
      y: 0.5, // Position at bottom edge
      offsetX: 0,
      offsetY: 8, // Positive offset to move down from bottom
      cursorStyleHandler: () => 'ns-resize',
      actionHandler: fabric.controlsUtils.scalingY,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // White background with purple on hover
        const isHovered = hoveredControl === 'stretchV';
        const fillColor = isHovered ? '#8138ff' : 'white';
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'rgba(129, 56, 255, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add border
        ctx.strokeStyle = '#8138ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw vertical double arrow
        const iconColor = isHovered ? 'white' : '#8138ff';
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        
        // Main vertical line
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(0, 5);
        ctx.stroke();
        
        // Arrow heads
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
      sizeX: 20,
      sizeY: 20,
    });

    // Apply controls to fabric objects
    const customControls = {
      mt: rotateControl,         // Rotate on top-middle
      tr: deleteControl,         // Delete (trash) on top-right
      mb: stretchVerticalControl, // Vertical stretch on bottom
      mr: stretchHorizontalControl, // Horizontal stretch on right (tight to box)
      br: scaleControl,          // Scale on bottom-right
      // Hide default controls we don't want
      ml: new fabric.Control({ visible: false }),
      tl: new fabric.Control({ visible: false }),
      bl: new fabric.Control({ visible: false }),
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
