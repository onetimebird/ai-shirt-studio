// src/lib/fabricTextControls.ts
import { Textbox, Text, Control, controlsUtils, FabricObject, util } from "fabric";

// Import SVG icons
import deleteIcon from "@/assets/icons/delete.svg";
import cloneIcon from "@/assets/icons/clone.svg";
import rotateIcon from "@/assets/icons/rotate.svg";

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
    // Preload all icons
    Promise.all([
      util.loadImage(deleteIcon),
      util.loadImage(cloneIcon),
      util.loadImage(rotateIcon)
    ]).then(([deleteImg, cloneImg, rotateImg]) => {
      console.log('✅ All control icons loaded successfully');
      
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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw SVG icon
          ctx.drawImage(deleteImg, -size/2, -size/2, size, size);
          
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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw SVG icon
          ctx.drawImage(cloneImg, -size/2, -size/2, size, size);
          
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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw SVG icon
          ctx.drawImage(rotateImg, -size/2, -size/2, size, size);
          
          ctx.restore();
        }
      })
    };

      // Apply controls to text classes
      Text.prototype.controls = customControls;
      Textbox.prototype.controls = customControls;
      
      console.log('✅ Custom text controls initialized with SVG icons');
      
    }).catch(error => {
      console.error('❌ Failed to load SVG icons for controls:', error);
      
      // Fallback to basic controls without icons
      const fallbackControls = {
        tl: new Control({
          x: -0.5,
          y: -0.5,
          actionHandler: deleteObject,
          cursorStyle: 'pointer'
        }),
        tr: new Control({
          x: 0.5,
          y: -0.5,
          actionHandler: cloneObject,
          cursorStyle: 'pointer'
        }),
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
          actionName: 'rotate'
        })
      };
      
      Text.prototype.controls = fallbackControls;
      Textbox.prototype.controls = fallbackControls;
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
