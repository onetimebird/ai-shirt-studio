// src/lib/fabricTextControls.ts
import { Object as FabricObject, Control, controlsUtils } from "fabric";
import deleteIconUrl from "@/assets/icons/delete.svg";

// Initialize controls with custom delete icon as rotation handle
export function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // 1. Preload the SVG as an Image
    const iconImage = new Image();
    iconImage.src = deleteIconUrl;
    iconImage.onload = () => {
      const iconSize = 24; // match your SVG's intended size

      // 2. Create a custom Control using render function
      const deleteControl = new Control({
        x: 0,
        y: -0.5,
        offsetY: -iconSize / 2,
        cursorStyleHandler: () => 'pointer',
        actionHandler: controlsUtils.rotationWithSnapping,
        render: (ctx, left, top, styleOverride, object) => {
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate((object.angle || 0) * Math.PI / 180);
          ctx.drawImage(
            iconImage,
            -iconSize / 2,
            -iconSize / 2,
            iconSize,
            iconSize
          );
          ctx.restore();
        },
      });

      // 3. Override the rotate handle for all objects
      FabricObject.prototype.controls.mtr = deleteControl;

      console.log("✅ Custom rotation control initialized successfully");
    };
    
    iconImage.onerror = () => {
      console.error("❌ Failed to load deleteIcon");
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
