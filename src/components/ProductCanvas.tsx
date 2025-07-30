import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { getColorByName } from "@/data/gildan2000Colors";
import { Button } from "@/components/ui/button";
import { QuantityModal } from "@/components/QuantityModal";
import { ArrowRight } from "lucide-react";
import "./ProductCanvas.css";

interface ProductCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  selectedProduct: string;
  onCanvasReady?: (canvas: FabricCanvas) => void;
}

export const ProductCanvas = ({ selectedColor, currentSide, selectedProduct, onCanvasReady }: ProductCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  // Initialize Fabric.js canvas ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate larger canvas dimensions to accommodate full t-shirt
    const isMobile = window.innerWidth < 768;
    const canvasWidth = isMobile ? Math.min(400, window.innerWidth - 20) : 800; // Much wider
    const canvasHeight = isMobile ? Math.min(500, (window.innerHeight - 200)) : 900; // Much taller

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent", // Keep transparent so we can see through
      selection: true,
      preserveObjectStacking: true,
      interactive: true,
      allowTouchScrolling: false,
    });

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, []); // NO dependencies - only run once on mount

  // Load the new t-shirt images as background
  useEffect(() => {
    if (!fabricCanvas) return;

    // Use the uploaded t-shirt images instead of the color system
    const imageUrl = currentSide === "front" 
      ? "/lovable-uploads/3d1d2c3e-6ad3-4fdd-b060-e3071653ccdd.png"  // front
      : "/lovable-uploads/24f3d8e6-2d8b-4f16-8f82-5b7aaae3331b.png"; // back
      
    console.log("Loading new t-shirt background:", imageUrl);

    // Load background image with CORS fix
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      // Calculate scale to make t-shirt much larger, especially on desktop
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 700;
      
      // Keep t-shirt at reasonable size within the larger canvas
      const isMobile = canvasWidth < 500;
      const scaleFactor = isMobile ? 0.8 : 0.9; // Much smaller scale - just enough to show full t-shirt
      
      const scaleX = (canvasWidth * scaleFactor) / (img.width || 1);
      const scaleY = (canvasHeight * scaleFactor) / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      // Set as background image - this keeps it behind all user content
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.backgroundImage = img;
      fabricCanvas.renderAll();
      
      console.log("New t-shirt background loaded successfully");
    }).catch((error) => {
      console.error("❌ Background load error:", error);
    });
  }, [fabricCanvas, currentSide]); // Load when canvas ready OR when side changes

  return (
    <div className="flex-1 flex items-start justify-center min-h-0 pt-1 lg:pt-2 relative">
      <Button 
        variant="default" 
        size="sm"
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white hidden lg:flex h-10 justify-start"
        onClick={() => setIsQuantityModalOpen(true)}
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Next Step
      </Button>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* NO <img> here—Fabric is already drawing the shirt as a background */}
        <canvas 
          ref={canvasRef}
          id="design-canvas"
          className="max-w-full"
          style={{ 
            position: 'relative',
            zIndex: 50,
            pointerEvents: 'auto',
            backgroundColor: 'transparent',
            maxWidth: '100%',
            height: 'auto',
            cursor: 'default'
          }}
        />
      </div>
      
      {/* Quantity Modal */}
      <QuantityModal 
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
      />
    </div>
  );
};