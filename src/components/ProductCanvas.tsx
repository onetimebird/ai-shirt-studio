import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { getColorByName } from "@/data/gildan2000Colors";

interface ProductCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export const ProductCanvas = ({ selectedColor, currentSide, onCanvasReady }: ProductCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [productImage, setProductImage] = useState<FabricImage | null>(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 700,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    // Make canvas available globally for design tools
    (window as any).designCanvas = { canvas };

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, [onCanvasReady]);

  // Load product image when color or side changes
  useEffect(() => {
    console.log("ProductCanvas useEffect triggered:", { fabricCanvas: !!fabricCanvas, selectedColor, currentSide });
    
    if (!fabricCanvas) return;

    const colorData = getColorByName(selectedColor);
    console.log("Color data found:", colorData);
    
    if (!colorData || !colorData.available) {
      console.log("Color not available or not found:", { colorData, available: colorData?.available });
      return;
    }

    const imageUrl = currentSide === "front" ? colorData.frontImage : colorData.backImage;
    console.log("Loading image from URL:", imageUrl);

    // Remove existing product image
    if (productImage) {
      fabricCanvas.remove(productImage);
      setProductImage(null);
    }

    // Load new product image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      console.log("Image loaded successfully:", img);
      
      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 700;
      
      const scaleX = (canvasWidth * 0.8) / (img.width || 1);
      const scaleY = (canvasHeight * 0.8) / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      img.scale(scale);
      img.set({
        left: (canvasWidth - (img.width || 0) * scale) / 2,
        top: (canvasHeight - (img.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
        excludeFromExport: false,
      });

      // Add image as background layer
      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);
      setProductImage(img);
      fabricCanvas.renderAll();
      console.log("Image added to canvas successfully");
    }).catch((error) => {
      console.error("Failed to load product image:", error);
    });
  }, [fabricCanvas, selectedColor, currentSide]);

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg p-6">
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="border border-border rounded-lg shadow-lg bg-card"
        />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
          {selectedColor} - {currentSide}
        </div>
      </div>
    </div>
  );
};