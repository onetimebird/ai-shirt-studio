import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import deleteIcon from "@/assets/icons/delete.svg";

export default function SmokeTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, { width: 400, height: 200 });

    // preload the icon
    fabric.util.loadImage(deleteIcon).then(img => {
      console.log("✅ Smoke test: deleteIcon loaded", img.width, img.height);
      
      // patch IText controls
      fabric.IText.prototype.controls = {
        mtr: new fabric.Control({
          x: 0, y: -0.5,
          actionHandler: fabric.controlsUtils.rotationWithSnapping,
          render(ctx, left, top, styleOverride, obj) {
            const size = 24;
            ctx.save();
            ctx.translate(left, top);
            ctx.rotate(obj.angle * Math.PI / 180);
            ctx.drawImage(img, -size/2, -size/2, size, size);
            ctx.restore();
          }
        })
      };
      
      // add a text object
      const txt = new fabric.IText("Hello", { left: 200, top: 100, fontSize: 32 });
      canvas.add(txt);
      canvas.setActiveObject(txt);
      canvas.renderAll();
    }).catch(error => {
      console.error("❌ Smoke test: Failed to load deleteIcon", error);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Fabric.js Custom Control Smoke Test</h2>
      <p className="text-sm text-gray-600 mb-4">
        Click on the "Hello" text. You should see a trash icon above it if SVGs are working.
      </p>
      <canvas ref={canvasRef} className="border border-gray-300" />
    </div>
  );
}