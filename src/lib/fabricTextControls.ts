// src/lib/fabricTextControls.ts
import * as fabric from "fabric";
import deleteSvgUrl from "@/assets/icons/delete.svg";

// Initialize controls with custom delete icon as rotation handle
export function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // 1) Fetch the raw SVG and convert to Base64
    fetch(deleteSvgUrl)
      .then(res => res.text())
      .then(svgText => {
        const base64 = btoa(svgText);
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${base64}`;

        img.onload = () => {
          const ICON_SIZE = 24;

          // 2) Create a custom Control using render function
          const deleteControl = new fabric.Control({
            x: 0,
            y: -0.5,
            offsetY: -ICON_SIZE / 2,
            cursorStyleHandler: () => 'pointer',
            actionName: 'rotate',
            actionHandler: fabric.controlsUtils.rotationWithSnapping,
            render: (ctx, left, top, styleOverride, object) => {
              ctx.save();
              ctx.translate(left, top);
              ctx.rotate((object.angle || 0) * Math.PI / 180);
              ctx.drawImage(img, -ICON_SIZE/2, -ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
              ctx.restore();
            },
            sizeX: ICON_SIZE,
            sizeY: ICON_SIZE,
            touchSizeX: ICON_SIZE,
            touchSizeY: ICON_SIZE,
          });

          // 3) Override the rotate handle for *all* objects
          fabric.Object.prototype.controls.mtr = deleteControl;

          console.log("✅ Custom rotation control initialized successfully");
        };

        img.onerror = () => {
          console.error("❌ Failed to load SVG image");
        };
      })
      .catch(err => console.error('❌ SVG load failed:', err));
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
