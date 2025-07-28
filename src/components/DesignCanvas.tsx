import React, { useRef, useEffect } from "react";
import "@/lib/fabricTextControls";             // 🧩 must import *once* before using Canvas/Textbox
import { Canvas, Textbox } from "fabric";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export const DesignCanvas: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasEl.current) return;
    
    const canvas = new Canvas(canvasEl.current, {
      width: 800,
      height: 600,
      backgroundColor: "transparent",
      selection: true,
    });
    
    canvasRef.current = canvas;

    // demo: add one Textbox
    const txt = new Textbox("Jason", {
      left: 400,
      top: 300,
      fontSize: 48,
      originX: "center",
      originY: "center",
      editable: true,
    });
    canvas.add(txt);
    canvas.setActiveObject(txt);
    canvas.renderAll();

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  return (
    <div>
      <div className="mb-2">
        <Badge>Design Canvas</Badge>
        <Button onClick={() => canvasRef.current?.setZoom(canvasRef.current.getZoom() * 1.2)}>
          <ZoomIn />
        </Button>
        <Button onClick={() => canvasRef.current?.setZoom(canvasRef.current.getZoom() / 1.2)}>
          <ZoomOut />
        </Button>
        <Button onClick={() => canvasRef.current?.setZoom(1)}>
          <RefreshCw />
        </Button>
      </div>
      <canvas ref={canvasEl} className="border" />
    </div>
  );
};