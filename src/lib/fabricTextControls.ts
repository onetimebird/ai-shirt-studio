
import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Create custom controls that match RushOrderTees style
export function initializeTextControls() {
  console.log('🔧 initializeTextControls called - creating ROT-style controls...');
  
  try {
    // Create delete control with refined trash icon
    const deleteControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -12,
      offsetY: -12,
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
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background with subtle shadow
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 13%, 91%)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Draw refined trash can icon
        ctx.strokeStyle = 'hsl(215, 16%, 47%)';
        ctx.fillStyle = 'hsl(215, 16%, 47%)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Trash can lid
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(6, -4);
        ctx.stroke();
        
        // Trash can body (more refined shape)
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.lineTo(-3, 6);
        ctx.lineTo(3, 6);
        ctx.lineTo(4, -2);
        ctx.closePath();
        ctx.stroke();
        
        // Vertical lines inside (cleaner spacing)
        ctx.beginPath();
        ctx.moveTo(-1.5, 0);
        ctx.lineTo(-1.5, 4);
        ctx.moveTo(1.5, 0);
        ctx.lineTo(1.5, 4);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create rotation control with refined rotate icon (restored original functionality)
    const rotateControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 12,
      offsetY: -12,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      render: (ctx, left, top) => {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background with subtle shadow
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 13%, 91%)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Draw refined rotation arrow
        ctx.strokeStyle = 'hsl(215, 16%, 47%)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Curved arrow (more refined)
        ctx.beginPath();
        ctx.arc(0, 0, 5, -Math.PI/2, Math.PI/3);
        ctx.stroke();
        
        // Arrow head (more precise)
        ctx.beginPath();
        ctx.moveTo(3.5, 3.5);
        ctx.lineTo(2, 5.5);
        ctx.lineTo(5.5, 2);
        ctx.closePath();
        ctx.fillStyle = 'hsl(215, 16%, 47%)';
        ctx.fill();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create uniform scale control with refined resize arrows (restored original functionality)
    const scaleControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 12,
      offsetY: 12,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: (ctx, left, top) => {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background with subtle shadow
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 13%, 91%)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Draw refined diagonal double arrow
        ctx.strokeStyle = 'hsl(215, 16%, 47%)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Main diagonal line
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.stroke();
        
        // Arrow heads (more refined)
        ctx.beginPath();
        // Top-left arrow
        ctx.moveTo(-5, -5);
        ctx.lineTo(-2, -5);
        ctx.moveTo(-5, -5);
        ctx.lineTo(-5, -2);
        
        // Bottom-right arrow
        ctx.moveTo(5, 5);
        ctx.lineTo(2, 5);
        ctx.moveTo(5, 5);
        ctx.lineTo(5, 2);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create horizontal stretch control (restored original functionality)
    const stretchControl = new fabric.Control({
      x: 1,
      y: 0,
      offsetX: 12,
      offsetY: 0,
      cursorStyleHandler: () => 'ew-resize',
      actionHandler: fabric.controlsUtils.scalingX,
      render: (ctx, left, top) => {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background with subtle shadow
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'hsl(220, 13%, 91%)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add subtle shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        
        // Draw refined horizontal double arrow
        ctx.strokeStyle = 'hsl(215, 16%, 47%)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Main horizontal line
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.stroke();
        
        // Arrow heads (more refined)
        ctx.beginPath();
        // Left arrow
        ctx.moveTo(-6, 0);
        ctx.lineTo(-3, -2.5);
        ctx.moveTo(-6, 0);
        ctx.lineTo(-3, 2.5);
        
        // Right arrow
        ctx.moveTo(6, 0);
        ctx.lineTo(3, -2.5);
        ctx.moveTo(6, 0);
        ctx.lineTo(3, 2.5);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Apply controls to fabric objects
    const customControls = {
      tl: deleteControl,
      tr: rotateControl,
      br: scaleControl,
      mr: stretchControl,
      // Hide default controls we don't want
      mb: new fabric.Control({ visible: false }),
      ml: new fabric.Control({ visible: false }),
      mt: new fabric.Control({ visible: false }),
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
    console.log('✅ ROT-style controls applied to object');
  }
}
