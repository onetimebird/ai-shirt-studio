// src/lib/fabricTextControls.ts
import { Textbox, Text, Control, controlsUtils } from "fabric";

// SVG icons as data URLs
const icons = {
  delete: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmY0NDQ0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTMgNiAzIDEyYzAgLjYuNCAxIDEgMWg4Yy42IDAgMS0uNCAxLTFsMy0xMiIvPjxwYXRoIGQ9Ik04IDZWNGMWLS42LjQtMSAxLTFoNGMuNiAwIDEgLjQgMSAxdjIiLz48bGluZSB4MT0iMTAiIHgyPSIxMCIgeTE9IjExIiB5Mj0iMTciLz48bGluZSB4MT0iMTQiIHgyPSIxNCIgeTE9IjExIiB5Mj0iMTciLz48L3N2Zz4=",
  clone: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDA3YWZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3Qgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiB4PSI4IiB5PSI4IiByeD0iMiIgcnk9IjIiLz48cGF0aCBkPSJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyIi8+PC9zdmc+",
  rotate: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDBjODUwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDEyYTkgOSAwIDAgMC05LTkgOS43NSA5Ljc1IDAgMCAwLTYuNzQgMi43NEwzIDgiLz48cGF0aCBkPSJNMyAzdjVoNSIvPjxwYXRoIGQ9Ik0zIDEyYTkgOSAwIDAgMCA5IDkgOS43NSA5Ljc1IDAgMCAwIDYuNzQtMi43NEwyMSAxNiIvPjxwYXRoIGQ9Ik0xNiAxNmg1djUiLz48L3N2Zz4="
};

// Helper to load image from data URL
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Control handlers
const deleteHandler = (e: any, transform: any) => {
  const canvas = transform.target.canvas;
  canvas.remove(transform.target);
  canvas.renderAll();
  
  // Update objects list
  setTimeout(() => {
    if ((window as any).designCanvas?.updateTextObjects) {
      (window as any).designCanvas.updateTextObjects();
    }
  }, 100);
  
  return true;
};

const cloneHandler = (e: any, transform: any) => {
  const target = transform.target;
  target.clone().then((cloned: any) => {
    cloned.set({
      left: target.left + 20,
      top: target.top + 20,
    });
    target.canvas.add(cloned);
    target.canvas.setActiveObject(cloned);
    target.canvas.renderAll();
    
    // Update objects list
    setTimeout(() => {
      if ((window as any).designCanvas?.updateTextObjects) {
        (window as any).designCanvas.updateTextObjects();
      }
    }, 100);
  });
  return true;
};

// Create control with icon
function createIconControl(iconImg: HTMLImageElement, handler: any, position: { x: number; y: number }) {
  return new Control({
    x: position.x,
    y: position.y,
    offsetX: 0,
    offsetY: 0,
    cursorStyle: 'pointer',
    actionHandler: handler,
    render(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
      const size = 24;
      
      ctx.save();
      ctx.translate(left, top);
      
      // Draw circle background
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw icon
      const iconSize = size * 0.6;
      ctx.drawImage(iconImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
      
      ctx.restore();
    }
  });
}

// Initialize controls
async function initializeTextControls() {
  try {
    console.log('🔧 Loading text control icons...');
    
    const [deleteImg, cloneImg, rotateImg] = await Promise.all([
      loadImage(icons.delete),
      loadImage(icons.clone),
      loadImage(icons.rotate)
    ]);
    
    console.log('✅ Icons loaded successfully');
    
    // Create controls
    const customControls = {
      tl: createIconControl(deleteImg, deleteHandler, { x: -0.5, y: -0.5 }),
      tr: createIconControl(cloneImg, cloneHandler, { x: 0.5, y: -0.5 }),
      mtr: createIconControl(rotateImg, controlsUtils.rotationWithSnapping, { x: 0, y: -0.7 }),
      // Keep default scaling controls
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
      })
    };
    
    // Apply to both Text and Textbox
    Text.prototype.controls = customControls;
    Textbox.prototype.controls = customControls;
    
    // Disable caching for better control rendering
    Text.prototype.objectCaching = false;
    Textbox.prototype.objectCaching = false;
    
    console.log('✅ Text controls initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}

// Initialize when module loads
initializeTextControls();

export { initializeTextControls };
