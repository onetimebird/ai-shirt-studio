import * as fabric from "fabric";

console.log('🔧 fabricTextControls.ts loaded');

// Create simple text controls with basic shapes instead of SVGs
export function initializeTextControls() {
  console.log('🔧 initializeTextControls called - creating custom controls...');
  
  try {
    // Create delete control with red X
    const deleteControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: -20,
      offsetY: -20,
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
        
        // Draw white circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw red X
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, -6);
        ctx.lineTo(6, 6);
        ctx.moveTo(6, -6);
        ctx.lineTo(-6, 6);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Create scale control with resize icon
    const scaleControl = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: 20,
      offsetY: 20,
      cursorStyleHandler: () => 'nw-resize',
      actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.scalingEqually(eventData, transform, 0, 0);
      },
      render: (ctx, left, top) => {
        const size = 24;
        ctx.save();
        ctx.translate(left, top);
        
        // Draw white circle background
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw resize arrows
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Diagonal arrows
        ctx.moveTo(-8, -8);
        ctx.lineTo(8, 8);
        ctx.moveTo(6, 6);
        ctx.lineTo(8, 8);
        ctx.lineTo(8, 6);
        ctx.stroke();
        
        ctx.restore();
      },
      sizeX: 24,
      sizeY: 24,
    });

    // Apply controls to fabric objects
    const customControls = {
      tl: deleteControl,
      br: scaleControl,
      tr: new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetX: 20,
        offsetY: -20,
        cursorStyleHandler: () => 'crosshair',
        actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => {
          return fabric.controlsUtils.rotationWithSnapping(eventData, transform, 0, 0);
        },
        render: (ctx, left, top) => {
          const size = 24;
          ctx.save();
          ctx.translate(left, top);
          
          // Draw white circle
          ctx.beginPath();
          ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.strokeStyle = '#ccc';
          ctx.stroke();
          
          // Draw rotation arrow
          ctx.strokeStyle = '#666';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 1.5);
          ctx.stroke();
          
          ctx.restore();
        },
        sizeX: 24,
        sizeY: 24,
      }),
      // Hide default controls we don't want
      mb: new fabric.Control({ visible: false }),
      ml: new fabric.Control({ visible: false }),
      mt: new fabric.Control({ visible: false }),
      mr: new fabric.Control({ visible: false }),
      bl: new fabric.Control({ visible: false }),
      mtr: new fabric.Control({ visible: false }),
    };
    
    // Store controls globally for use
    (window as any).customFabricControls = customControls;
    
    console.log('✅ Custom controls created and stored globally');
    
  } catch (error) {
    console.error('❌ Failed to create controls:', error);
  }
  
  return Promise.resolve();
}

// Function to apply controls to objects
export function applyCustomControlsToObject(obj: fabric.Object) {
  console.log('🎯 Applying custom controls to:', obj.type);
  const customControls = (window as any).customFabricControls;
  if (customControls && obj) {
    obj.controls = customControls;
    console.log('✅ Custom controls applied to object');
  }
}