// src/lib/fabricTextControls.ts
import { Textbox, Text, Control, controlsUtils, FabricObject } from "fabric";

// SVG icons as base64 encoded strings  
const deleteIcon = "data:image/svg+xml;base64," + btoa('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2"><path d="m3 6 3 12c0 .6.4 1 1 1h8c.6 0 1-.4 1-1l3-12"/><path d="M8 6V4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>');

const cloneIcon = "data:image/svg+xml;base64," + btoa('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007aff" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>');

const rotateIcon = "data:image/svg+xml;base64," + btoa('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00c850" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>');

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

// Cache for loaded images
const imageCache: Record<string, HTMLImageElement> = {};

// Preload an image
function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (imageCache[url]) {
      resolve(imageCache[url]);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      imageCache[url] = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Custom render function for icon controls
function renderIcon(iconUrl: string) {
  return function(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: any) {
    const img = imageCache[iconUrl];
    if (!img) return;
    
    const size = 20;
    
    ctx.save();
    ctx.translate(left, top);
    
    // Draw circle background
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw icon
    const iconSize = size * 0.6;
    ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
    
    ctx.restore();
  };
}

// Initialize text controls with proper Fabric.js v6 API
export async function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // Preload all images
    await Promise.all([
      preloadImage(deleteIcon),
      preloadImage(cloneIcon),
      preloadImage(rotateIcon)
    ]);
    console.log('✅ Icons preloaded');
    
    // Create custom controls using proper v6 API
    const deleteControl = new Control({
      x: -0.5,
      y: -0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      actionHandler: deleteObject,
      render: renderIcon(deleteIcon)
    });

    const cloneControl = new Control({
      x: 0.5,
      y: -0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      actionHandler: cloneObject,
      render: renderIcon(cloneIcon)
    });

    const rotateControl = new Control({
      x: 0,
      y: -0.7,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'crosshair',
      actionHandler: controlsUtils.rotationWithSnapping,
      render: renderIcon(rotateIcon)
    });

    // Create the complete controls object
    const customControls = {
      tl: deleteControl,
      tr: cloneControl,
      mtr: rotateControl,
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
