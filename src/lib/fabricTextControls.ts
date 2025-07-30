// src/lib/fabricTextControls.ts
import { Textbox, Text, Control, controlsUtils, FabricObject } from "fabric";

// Control action handlers
function deleteObject(eventData: MouseEvent, transformData: any, x: number, y: number) {
  const canvas = transformData.target.canvas;
  canvas.remove(transformData.target);
  canvas.renderAll();
  
  // Update objects list
  setTimeout(() => {
    if ((window as any).designCanvas?.updateTextObjects) {
      (window as any).designCanvas.updateTextObjects();
    }
  }, 100);
  
  return true;
}

function cloneObject(eventData: MouseEvent, transformData: any, x: number, y: number) {
  const target = transformData.target;
  target.clone().then((cloned: FabricObject) => {
    cloned.set({
      left: (target.left || 0) + 20,
      top: (target.top || 0) + 20,
    });
    target.canvas?.add(cloned);
    target.canvas?.setActiveObject(cloned);
    target.canvas?.renderAll();
    
    // Update objects list
    setTimeout(() => {
      if ((window as any).designCanvas?.updateTextObjects) {
        (window as any).designCanvas.updateTextObjects();
      }
    }, 100);
  });
  return true;
}

// Initialize text controls with proper Fabric.js v6 API
export function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // Create custom controls using proper v6 API
    const deleteControl = new Control({
      x: -0.5,
      y: -0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      actionHandler: deleteObject,
      render: function(ctx: CanvasRenderingContext2D, left: number, top: number) {
        const size = 20;
        
        ctx.save();
        ctx.translate(left, top);
        
        // Draw circle background
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw X
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(4, 4);
        ctx.moveTo(4, -4);
        ctx.lineTo(-4, 4);
        ctx.stroke();
        
        ctx.restore();
      }
    });

    const cloneControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      actionHandler: cloneObject,
      render: function(ctx: CanvasRenderingContext2D, left: number, top: number) {
        const size = 20;
        
        ctx.save();
        ctx.translate(left, top);
        
        // Draw circle background
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 120, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw two squares (copy icon)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-3, -3, 4, 4);
        ctx.strokeRect(-1, -1, 4, 4);
        
        ctx.restore();
      }
    });

    // Create the complete controls object
    const customControls = {
      tl: deleteControl,
      tr: cloneControl,
      // Keep standard scaling controls
      mr: new Control({
        x: 0.5,
        y: 0,
        actionHandler: controlsUtils.scalingXOrSkewingY,
        cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'scaleX'
      }),
      br: new Control({
        x: 0.5,
        y: 0.5,
        actionHandler: controlsUtils.scalingEqually,
        cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
        actionName: 'scale'
      }),
      ml: new Control({
        x: -0.5,
        y: 0,
        actionHandler: controlsUtils.scalingXOrSkewingY,
        cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'scaleX'
      }),
      mb: new Control({
        x: 0,
        y: 0.5,
        actionHandler: controlsUtils.scalingYOrSkewingX,
        cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'scaleY'
      }),
      mt: new Control({
        x: 0,
        y: -0.5,
        actionHandler: controlsUtils.scalingYOrSkewingX,
        cursorStyleHandler: controlsUtils.scaleSkewCursorStyleHandler,
        actionName: 'scaleY'
      }),
      bl: new Control({
        x: -0.5,
        y: 0.5,
        actionHandler: controlsUtils.scalingEqually,
        cursorStyleHandler: controlsUtils.scaleCursorStyleHandler,
        actionName: 'scale'
      }),
      mtr: new Control({
        x: 0,
        y: -0.5,
        offsetY: -40,
        actionHandler: controlsUtils.rotationWithSnapping,
        cursorStyleHandler: controlsUtils.rotationStyleHandler,
        actionName: 'rotate',
        render: function(ctx: CanvasRenderingContext2D, left: number, top: number) {
          const size = 20;
          
          ctx.save();
          ctx.translate(left, top);
          
          // Draw circle background
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 200, 80, 0.8)';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw rotation arrow
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 1.5);
          ctx.stroke();
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(-4, -2);
          ctx.lineTo(-2, -4);
          ctx.lineTo(0, -2);
          ctx.stroke();
          
          ctx.restore();
        }
      })
    };

    // Apply controls to text classes
    Text.prototype.controls = customControls;
    Textbox.prototype.controls = customControls;
    
    console.log('✅ Custom text controls initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
