import React, { useRef, useEffect } from "react";
import "@/lib/fabricTextControls"; // must import this before using Canvas/Textbox
import { Canvas, Textbox } from "fabric";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export const DesignCanvas: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  let canvas: Canvas;

  useEffect(() => {
    if (!canvasEl.current) return;
    canvas = new Canvas(canvasEl.current, {
      width: 800,
      height: 600,
      backgroundColor: "transparent",
      selection: true,
    });

    // Create and add the Textbox
    const txt = new Textbox("Jason", {
      left: 400,
      top: 300,
      fontSize: 48,
      originX: "center",
      originY: "center",
      editable: true,
    });

    // **Correct**: add first, then setActiveObject
    canvas.add(txt);
    canvas.setActiveObject(txt);
    canvas.requestRenderAll();

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Badge>Design Canvas</Badge>
        <Button onClick={() => canvas?.setZoom(canvas.getZoom() * 1.2)}>
          <ZoomIn />
        </Button>
        <Button onClick={() => canvas?.setZoom(canvas.getZoom() / 1.2)}>
          <ZoomOut />
        </Button>
        <Button onClick={() => canvas?.setZoom(1)}>
          <RefreshCw />
        </Button>
      </div>
      <canvas ref={canvasEl} className="border" />
    </div>
  );
};