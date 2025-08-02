// src/lib/fabricTextControls.ts
import * as fabric from "fabric";
import deleteSvgUrl from "@/assets/icons/delete.svg";
import rotateSvgUrl from "@/assets/icons/rotate.svg";
import stretchSvgUrl from "@/assets/icons/stretch.svg";
import stretchVerticalSvgUrl from "@/assets/icons/stretch-vertical.svg";
import scaleSvgUrl from "@/assets/icons/scale.svg";
import layerSvgUrl from "@/assets/icons/layer.svg";
import cloneSvgUrl from "@/assets/icons/clone.svg";

interface IconImages {
  delete: HTMLImageElement;
  rotate: HTMLImageElement;
  stretch: HTMLImageElement;
  scale: HTMLImageElement;
  layer: HTMLImageElement;
  clone: HTMLImageElement;
}

// Helper function to load SVG as image
const loadSvgImage = (svgUrl: string): Promise<HTMLImageElement> => {
  return fetch(svgUrl)
    .then(res => res.text())
    .then(svgText => {
      const base64 = btoa(svgText);
      const img = new Image();
      img.src = `data:image/svg+xml;base64,${base64}`;
      return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    });
};

// Custom delete action handler
const deleteHandler = (eventData: any, transform: any) => {
  const target = transform.target;
  const canvas = target.canvas;
  canvas.remove(target);
  canvas.requestRenderAll();
  return true;
};

// Create control with icon and white circular background
const createControl = (
  x: number, 
  y: number, 
  icon: HTMLImageElement, 
  actionHandler: any, 
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
    render: (ctx, left, top, styleOverride, object) => {
      ctx.save();
      ctx.translate(left, top);
      
      // Draw white circle background
      ctx.beginPath();
      ctx.arc(0, 0, CIRCLE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw icon
      ctx.drawImage(icon, -ICON_SIZE/2, -ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
      ctx.restore();
    },
    sizeX: CIRCLE_SIZE,
    sizeY: CIRCLE_SIZE,
    touchSizeX: CIRCLE_SIZE,
    touchSizeY: CIRCLE_SIZE,
  });
};

// Initialize controls with custom icons
export function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // Load all SVG icons
    Promise.all([
      loadSvgImage(deleteSvgUrl),
      loadSvgImage(rotateSvgUrl),
      loadSvgImage(stretchSvgUrl),
      loadSvgImage(stretchVerticalSvgUrl),
      loadSvgImage(scaleSvgUrl),
      loadSvgImage(layerSvgUrl),
      loadSvgImage(cloneSvgUrl),
    ]).then(([deleteImg, rotateImg, stretchHorizontalImg, stretchVerticalImg, scaleImg, layerImg, cloneImg]) => {
      const OFFSET = 20;
      
      // Create custom controls
      const deleteControl = createControl(
        -0.5, -0.5, deleteImg, deleteHandler, 'pointer', -OFFSET, -OFFSET
      );
      
      const rotateControl = createControl(
        0.5, -0.5, rotateImg, fabric.controlsUtils.rotationWithSnapping, 'crosshair', OFFSET, -OFFSET
      );
      
      const stretchHorizontalControl = createControl(
        0.5, 0, stretchHorizontalImg, fabric.controlsUtils.scalingXOrSkewingY, 'ew-resize', OFFSET, 0
      );
      
      const stretchVerticalControl = createControl(
        0, -0.5, stretchVerticalImg, fabric.controlsUtils.scalingYOrSkewingX, 'ns-resize', 0, -OFFSET
      );
      
      const scaleControl = createControl(
        0.5, 0.5, scaleImg, fabric.controlsUtils.scalingEqually, 'nw-resize', OFFSET, OFFSET
      );
      
      const layerControl = createControl(
        -0.5, 0.5, layerImg, (eventData: any, transform: any) => {
          // Toggle layer order - bring to front or send to back
          const target = transform.target;
          const canvas = target.canvas;
          if (eventData.shiftKey) {
            canvas.sendBackwards(target);
          } else {
            canvas.bringForward(target);
          }
          canvas.requestRenderAll();
          return true;
        }, 'pointer', -OFFSET, OFFSET
      );

      // Apply controls to all objects
      fabric.Object.prototype.controls = {
        ...fabric.Object.prototype.controls,
        // Corner controls
        tl: deleteControl,        // Top-left: Delete
        tr: rotateControl,        // Top-right: Rotate  
        br: scaleControl,         // Bottom-right: Scale
        bl: layerControl,         // Bottom-left: Layer
        // Side controls
        mt: stretchVerticalControl,   // Middle-top: Vertical stretch
        mr: stretchHorizontalControl, // Middle-right: Horizontal stretch
        // Remove default controls we don't want
        mb: new fabric.Control({ visible: false }),
        ml: new fabric.Control({ visible: false }),
        mtr: new fabric.Control({ visible: false }), // Remove default rotation control
      };

      console.log("✅ All custom controls initialized successfully");
    }).catch(error => {
      console.error("❌ Failed to load SVG icons:", error);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
