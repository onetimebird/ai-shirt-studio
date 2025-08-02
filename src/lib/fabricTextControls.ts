import * as fabric from "fabric";

// Import SVG files directly
import deleteIconUrl from "@/assets/icons/delete-control.svg";
import rotateIconUrl from "@/assets/icons/rotate-control.svg";
import stretchIconUrl from "@/assets/icons/stretch-control.svg";
import stretchVerticalIconUrl from "@/assets/icons/stretch-vertical-control.svg";
import scaleIconUrl from "@/assets/icons/scale-control.svg";
import layerIconUrl from "@/assets/icons/layer-control.svg";
import cloneIconUrl from "@/assets/icons/clone-control.svg";

// Simple image loader that works with imported URLs
const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`✅ Loaded icon: ${url}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error(`❌ Failed to load icon: ${url}`, error);
      reject(error);
    };
    
    img.src = url;
  });
};

// Delete handler
const deleteHandler = (eventData: MouseEvent, transform: fabric.Transform) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (canvas && target) {
    canvas.remove(target);
    canvas.requestRenderAll();
  }
  return true;
};

// Clone handler
const cloneHandler = (eventData: MouseEvent, transform: fabric.Transform) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (canvas && target) {
    target.clone().then((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  }
  return true;
};

// Layer handler
const layerHandler = (eventData: MouseEvent, transform: fabric.Transform) => {
  const target = transform.target;
  const canvas = target.canvas;
  if (canvas && target) {
    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(target);
    
    if (eventData.shiftKey) {
      // Send backwards
      if (currentIndex > 0) {
        canvas.moveObjectTo(target, currentIndex - 1);
      }
    } else {
      // Bring forward
      if (currentIndex < objects.length - 1) {
        canvas.moveObjectTo(target, currentIndex + 1);
      }
    }
    canvas.requestRenderAll();
  }
  return true;
};

// Create control with icon
const createControl = (
  x: number,
  y: number,
  icon: HTMLImageElement,
  actionHandler: (eventData: MouseEvent, transform: fabric.Transform) => boolean,
  cursorStyle: string = 'pointer',
  offsetX: number = 0,
  offsetY: number = 0
) => {
  const ICON_SIZE = 20;
  const CIRCLE_SIZE = 32;
  
  return new fabric.Control({
    x,
    y,
    offsetX,
    offsetY,
    cursorStyleHandler: () => cursorStyle,
    actionHandler,
    render: (ctx, left, top, styleOverride, fabricObject) => {
      ctx.save();
      ctx.translate(left, top);
      
      // Draw white circle background with shadow
      ctx.beginPath();
      ctx.arc(0, 0, CIRCLE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      
      // Reset shadow and draw border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw icon
      if (icon.complete && icon.naturalWidth > 0) {
        ctx.drawImage(icon, -ICON_SIZE/2, -ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
      }
      
      ctx.restore();
    },
    sizeX: CIRCLE_SIZE,
    sizeY: CIRCLE_SIZE,
    touchSizeX: CIRCLE_SIZE,
    touchSizeY: CIRCLE_SIZE,
  });
};

// Main initialization function
export async function initializeTextControls() {
  console.log('🔧 Initializing custom text controls from scratch...');
  
  try {
    // Load all icons from actual files
    const iconImages = await Promise.all([
      loadImageFromUrl(deleteIconUrl),
      loadImageFromUrl(rotateIconUrl),
      loadImageFromUrl(stretchIconUrl),
      loadImageFromUrl(stretchVerticalIconUrl),
      loadImageFromUrl(scaleIconUrl),
      loadImageFromUrl(layerIconUrl),
      loadImageFromUrl(cloneIconUrl),
    ]);
    
    const [deleteImg, rotateImg, stretchImg, stretchVerticalImg, scaleImg, layerImg, cloneImg] = iconImages;
    
    const OFFSET = 20;
    
    // Create all controls
    const deleteControl = createControl(-0.5, -0.5, deleteImg, deleteHandler, 'pointer', -OFFSET, -OFFSET);
    const rotateControl = createControl(0.5, -0.5, rotateImg, 
      (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.rotationWithSnapping(eventData, transform, 0, 0);
      }, 'crosshair', OFFSET, -OFFSET);
    const stretchHorizontalControl = createControl(0.5, 0, stretchImg, 
      (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.scalingXOrSkewingY(eventData, transform, 0, 0);
      }, 'ew-resize', OFFSET, 0);
    const stretchVerticalControl = createControl(0, -0.5, stretchVerticalImg, 
      (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.scalingYOrSkewingX(eventData, transform, 0, 0);
      }, 'ns-resize', 0, -OFFSET);
    const scaleControl = createControl(0.5, 0.5, scaleImg, 
      (eventData: MouseEvent, transform: fabric.Transform) => {
        return fabric.controlsUtils.scalingEqually(eventData, transform, 0, 0);
      }, 'nw-resize', OFFSET, OFFSET);
    const layerControl = createControl(-0.5, 0.5, layerImg, layerHandler, 'pointer', -OFFSET, OFFSET);
    const cloneControl = createControl(-0.5, 0, cloneImg, cloneHandler, 'copy', -OFFSET, 0);
    
    // Apply controls to all fabric objects
    fabric.Object.prototype.controls = {
      tl: deleteControl,
      tr: rotateControl,
      br: scaleControl,
      bl: layerControl,
      mt: stretchVerticalControl,
      mr: stretchHorizontalControl,
      ml: cloneControl,
      mb: new fabric.Control({ visible: false }),
      mtr: new fabric.Control({ visible: false }),
    };
    
    console.log('✅ Custom text controls initialized successfully!');
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}