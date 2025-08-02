import * as fabric from "fabric";

// SVG icon data as strings for better reliability
const svgIcons = {
  delete: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m3 6 3 12c0 .6.4 1 1 1h8c.6 0 1-.4 1-1l3-12"/>
    <path d="M8 6V4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2"/>
    <line x1="10" x2="10" y1="11" y2="17"/>
    <line x1="14" x2="14" y1="11" y2="17"/>
  </svg>`,
  
  rotate: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>`,
  
  stretch: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="5 9 2 12 5 15"/>
    <polyline points="19 9 22 12 19 15"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
  </svg>`,
  
  stretchVertical: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 5 12 2 15 5"/>
    <polyline points="9 19 12 22 15 19"/>
    <line x1="12" x2="12" y1="2" y2="22"/>
  </svg>`,
  
  scale: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 3 9 15"/>
    <path d="M12 3h9v9"/>
    <path d="M3 21 15 9"/>
    <path d="M3 12v9h9"/>
  </svg>`,
  
  layer: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 10 4 15 9 20"/>
    <path d="m20 4-5 5h-4"/>
    <line x1="15" x2="20" y1="9" y2="4"/>
  </svg>`,
  
  clone: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>`
};

// Convert SVG string to Image object
const createImageFromSvg = (svgString: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
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
    // Load all icons
    const iconImages = await Promise.all([
      createImageFromSvg(svgIcons.delete),
      createImageFromSvg(svgIcons.rotate),
      createImageFromSvg(svgIcons.stretch),
      createImageFromSvg(svgIcons.stretchVertical),
      createImageFromSvg(svgIcons.scale),
      createImageFromSvg(svgIcons.layer),
      createImageFromSvg(svgIcons.clone),
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