
import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Track hover states for controls
let hoveredControl: string | null = null;

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
        
        // Create gradient background with shimmer effect when hovered
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        if (hoveredControl === 'delete') {
          // Shimmer effect - brighter colors
          gradient.addColorStop(0, 'hsl(262, 100%, 75%)');
          gradient.addColorStop(0.3, 'hsl(280, 100%, 85%)');
          gradient.addColorStop(0.6, 'hsl(300, 100%, 85%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 80%)');
        } else {
          // Normal colors
          gradient.addColorStop(0, 'hsl(262, 100%, 65%)');
          gradient.addColorStop(0.5, 'hsl(280, 90%, 70%)');
          gradient.addColorStop(1, 'hsl(300, 80%, 75%)');
        }
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'hsl(262, 100%, 65%, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw white trash icon
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
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

    // Create rotation control with proper curved arrow - positioned top-left
    const rotateControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -8,
      offsetY: -8,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Create gradient background with shimmer effect when hovered
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        if (hoveredControl === 'rotate') {
          // Shimmer effect - brighter colors
          gradient.addColorStop(0, 'hsl(262, 100%, 75%)');
          gradient.addColorStop(0.3, 'hsl(280, 100%, 85%)');
          gradient.addColorStop(0.6, 'hsl(300, 100%, 85%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 80%)');
        } else {
          // Normal colors
          gradient.addColorStop(0, 'hsl(262, 100%, 65%)');
          gradient.addColorStop(0.5, 'hsl(280, 90%, 70%)');
          gradient.addColorStop(1, 'hsl(300, 80%, 75%)');
        }
        // Draw gradient circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'hsl(262, 100%, 65%, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw white curved rotation arrow with clear arrow head
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'transparent';
        
        // Draw curved arrow path (3/4 circle)
        ctx.beginPath();
        ctx.arc(0, 0, 4, -Math.PI/2, Math.PI, false);
        ctx.stroke();
        
        // Draw clear arrow head pointing counterclockwise
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(-1.5, -2);
        ctx.lineTo(-1.5, 2);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Add arrow outline for better visibility
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        
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
        
        // Create gradient background with shimmer effect when hovered
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        if (hoveredControl === 'scale') {
          // Shimmer effect - brighter colors
          gradient.addColorStop(0, 'hsl(262, 100%, 75%)');
          gradient.addColorStop(0.3, 'hsl(280, 100%, 85%)');
          gradient.addColorStop(0.6, 'hsl(300, 100%, 85%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 80%)');
        } else {
          // Normal colors
          gradient.addColorStop(0, 'hsl(262, 100%, 65%)');
          gradient.addColorStop(0.5, 'hsl(280, 90%, 70%)');
          gradient.addColorStop(1, 'hsl(300, 80%, 75%)');
        }
        // Draw gradient circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'hsl(262, 100%, 65%, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw white diagonal double arrow
        ctx.strokeStyle = 'white';
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
        
        // Create gradient background with shimmer effect when hovered
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        if (hoveredControl === 'stretchH') {
          // Shimmer effect - brighter colors
          gradient.addColorStop(0, 'hsl(262, 100%, 75%)');
          gradient.addColorStop(0.3, 'hsl(280, 100%, 85%)');
          gradient.addColorStop(0.6, 'hsl(300, 100%, 85%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 80%)');
        } else {
          // Normal colors
          gradient.addColorStop(0, 'hsl(262, 100%, 65%)');
          gradient.addColorStop(0.5, 'hsl(280, 90%, 70%)');
          gradient.addColorStop(1, 'hsl(300, 80%, 75%)');
        }
        // Draw gradient circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'hsl(262, 100%, 65%, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw white horizontal double arrow
        ctx.strokeStyle = 'white';
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

    // Create vertical stretch control - positioned on top
    const stretchVerticalControl = new fabric.Control({
      x: 0,
      y: -0.8, // Position at top edge
      offsetX: 0,
      offsetY: 3, // Positive offset to bring it down from top
      cursorStyleHandler: () => 'ns-resize',
      actionHandler: fabric.controlsUtils.scalingY,
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Create gradient background with shimmer effect when hovered
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        if (hoveredControl === 'stretchV') {
          // Shimmer effect - brighter colors
          gradient.addColorStop(0, 'hsl(262, 100%, 75%)');
          gradient.addColorStop(0.3, 'hsl(280, 100%, 85%)');
          gradient.addColorStop(0.6, 'hsl(300, 100%, 85%)');
          gradient.addColorStop(1, 'hsl(320, 100%, 80%)');
        } else {
          // Normal colors
          gradient.addColorStop(0, 'hsl(262, 100%, 65%)');
          gradient.addColorStop(0.5, 'hsl(280, 90%, 70%)');
          gradient.addColorStop(1, 'hsl(300, 80%, 75%)');
        }
        // Draw gradient circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add elegant shadow
        ctx.shadowColor = 'hsl(262, 100%, 65%, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw white vertical double arrow
        ctx.strokeStyle = 'white';
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
      tl: rotateControl,         // Rotate on top-left
      tr: deleteControl,         // Delete (trash) on top-right
      mt: stretchVerticalControl, // Vertical stretch on top
      mr: stretchHorizontalControl, // Horizontal stretch on right (tight to box)
      br: scaleControl,          // Scale on bottom-right
      // Hide default controls we don't want
      ml: new fabric.Control({ visible: false }),
      mb: new fabric.Control({ visible: false }),
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
    
    // Apply dotted border styling
    obj.borderColor = 'hsl(262, 100%, 65%)'; // Primary color
    obj.borderDashArray = [5, 5]; // Dotted line pattern
    obj.borderScaleFactor = 2; // Make border slightly thicker
    obj.cornerColor = 'transparent'; // Hide corner squares
    obj.cornerSize = 0; // Remove corner size
    obj.transparentCorners = true;
    obj.borderOpacityWhenMoving = 0.8;
    
    console.log('✅ ROT-style controls and dotted border applied to object');
  }
}
