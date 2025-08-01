// src/lib/fabricTextControls.ts
import { Object as FabricObject, Control, controlsUtils, util } from "fabric";
import deleteIcon from "@/assets/icons/delete.svg";

// Initialize controls with custom delete icon as rotation handle
export function initializeTextControls() {
  console.log('🔧 Initializing custom text controls...');
  
  try {
    // Load the SVG once and create a single custom control
    util.loadImage(deleteIcon).then(img => {
      console.log("✅ deleteIcon loaded", img.width, img.height);

      // Create a Control that uses our SVG for the rotate handle
      const deleteCtrl = new Control({
        x: 0, 
        y: -0.5,
        actionHandler: controlsUtils.rotationWithSnapping,
        render(ctx, left, top, styleOverride, obj) {
          const size = 24;
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate(obj.angle * Math.PI/180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        }
      });

      // Override the mtr control on every object (text, images, shapes…)
      FabricObject.prototype.controls.mtr = deleteCtrl;

      console.log("✅ Custom rotation control initialized successfully");
      
    }).catch(error => {
      console.error("❌ Failed to load deleteIcon", error);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize text controls:', error);
  }
}
