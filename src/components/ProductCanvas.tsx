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
    const canvasWidth = isMobile ? Math.min(400, window.innerWidth - 20) : 1000; // Increased from 800 to 1000
    const canvasHeight = isMobile ? Math.min(500, (window.innerHeight - 200)) : 1100; // Increased from 900 to 1100

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
    console.log('[ProductCanvas] Canvas created, calling onCanvasReady');
    onCanvasReady?.(canvas);
    console.log('[ProductCanvas] onCanvasReady called');

    return () => {
      canvas.dispose();
    };
  }, []); // NO dependencies - only run once on mount

  // Load the t-shirt images based on selected color
  useEffect(() => {
    if (!fabricCanvas) return;

    // Get the color data to find the correct images
    const colorData = getColorByName(selectedColor);
    
    // Use color-specific images if available, otherwise fall back to default
    const imageUrl = currentSide === "front" 
      ? (colorData?.frontImage || "/lovable-uploads/3d1d2c3e-6ad3-4fdd-b060-e3071653ccdd.png")
      : (colorData?.backImage || "/lovable-uploads/24f3d8e6-2d8b-4f16-8f82-5b7aaae3331b.png");
      
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
      // Increased mobile scale factor by 15% for better visibility
      const scaleFactor = isMobile ? 0.92 : 0.9;
      
      const scaleX = (canvasWidth * scaleFactor) / (img.width || 1);
      const scaleY = (canvasHeight * scaleFactor) / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      // Set as background image - this keeps it behind all user content
      // Center the image position
      const topPosition = isMobile ? canvasHeight / 2 : canvasHeight / 2;
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: "center",
        originY: "center",
        left: canvasWidth / 2,
        top: topPosition,
        selectable: false,
        evented: false,
      });
      
      fabricCanvas.backgroundImage = img;
      fabricCanvas.renderAll();
      
      console.log("New t-shirt background loaded successfully");
    }).catch((error) => {
      console.error("❌ Background load error:", error);
    });
  }, [fabricCanvas, currentSide, selectedColor]); // Load when canvas ready, side changes, OR color changes

  // Handle side switching to separate front/back designs
  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Trigger side switch in the global canvas object
    if ((window as any).designCanvas?.switchToSide) {
      (window as any).designCanvas.switchToSide(currentSide);
    }
  }, [currentSide, fabricCanvas]);

  return (
    <div className="flex-1 flex items-start justify-center min-h-0 pt-1 lg:pt-2 relative">
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