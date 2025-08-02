
import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Create custom controls that match RushOrderTees style
export function initializeTextControls() {
  console.log('🔧 initializeTextControls called - creating ROT-style controls...');
  
  try {
    // Create delete control with trash icon
    const deleteControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -16,
      offsetY: -16,
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
        
        // Draw white circle background with border
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw trash can icon
        ctx.strokeStyle = '#6b7280';
        ctx.fillStyle = '#6b7280';
        ctx.lineWidth = 1.2;
        
        // Trash can lid
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(5, -4);
        ctx.stroke();
        
        // Trash can body
        ctx.beginPath();
        ctx.moveTo(-4, -3);
        ctx.lineTo(-3, 5);
        ctx.lineTo(3, 5);
        ctx.lineTo(4, -3);
        ctx.closePath();
        ctx.stroke();
        
        // Vertical lines inside
        ctx.beginPath();
        ctx.moveTo(-1.5, -1);
        ctx.lineTo(-1.5, 3);
        ctx.moveTo(1.5, -1);
        ctx.lineTo(1.5, 3);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 20,
      sizeY: 20,
    });

    // Create rotation control with rotate icon
    const rotateControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: 16,
      offsetY: -16,
      cursorStyleHandler: () => 'crosshair',
      actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.rotationWithSnapping(eventData, transform, 0, 0);
      },
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw rotation arrow
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        
        // Curved arrow
        ctx.arc(0, 0, 4, -Math.PI/2, Math.PI/4);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(2.8, 2.8);
        ctx.lineTo(1.5, 4);
        ctx.lineTo(4, 1.5);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 20,
      sizeY: 20,
    });

    // Create uniform scale control with resize arrows
    const scaleControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 16,
      offsetY: 16,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
        // Use scalingEqually for uniform scaling
        return fabric.controlsUtils.scalingEqually(eventData, transform, 0.5, 0.5);
      },
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw diagonal double arrow
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1.2;
        
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

    // Create horizontal stretch control
    const stretchControl = new fabric.Control({
      x: 1,
      y: 0,
      offsetX: 16,
      offsetY: 0,
      cursorStyleHandler: () => 'ew-resize',
      actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.scalingX(eventData, transform, 1, 0);
      },
      render: (ctx, left, top) => {
        const size = 20;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw horizontal double arrow
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1.2;
        
        // Main horizontal line
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.stroke();
        
        // Arrow heads
        ctx.beginPath();
        // Left arrow
        ctx.moveTo(-5, 0);
        ctx.lineTo(-3, -2);
        ctx.moveTo(-5, 0);
        ctx.lineTo(-3, 2);
        
        // Right arrow
        ctx.moveTo(5, 0);
        ctx.lineTo(3, -2);
        ctx.moveTo(5, 0);
        ctx.lineTo(3, 2);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 20,
      sizeY: 20,
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
