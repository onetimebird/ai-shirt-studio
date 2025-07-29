import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage } from "fabric";
import { getColorByName } from "@/data/gildan2000Colors";
import { Button } from "@/components/ui/button";
import { QuantityModal } from "@/components/QuantityModal";
import { DollarSign } from "lucide-react";

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
  // Remove productImage state since we're using setBackgroundImage now

  // Initialize Fabric.js canvas ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate responsive canvas dimensions
    const isMobile = window.innerWidth < 768;
    const canvasWidth = isMobile ? Math.min(350, window.innerWidth - 40) : 600;
    const canvasHeight = isMobile ? Math.min(420, (window.innerHeight - 200)) : 700;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    setFabricCanvas(canvas);
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
    };
  }, []); // NO dependencies - only run once on mount

  // Load product background image ONLY when color/side actually changes
  useEffect(() => {
    if (!fabricCanvas) return;

    const colorData = getColorByName(selectedColor);
    if (!colorData || !colorData.available) {
      return;
    }

    const imageUrl = currentSide === "front" ? colorData.frontImage : colorData.backImage;

    // Load background image - this won't affect user objects
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      // Calculate scale to fit canvas while maintaining aspect ratio
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 700;
      
      const scaleX = (canvasWidth * 0.8) / (img.width || 1);
      const scaleY = (canvasHeight * 0.8) / (img.height || 1);
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
      
      console.log("Background image set successfully - user content will stay on top");
    }).catch((error) => {
      console.error("Failed to load background image:", error);
    });
  }, [selectedColor, currentSide]); // ONLY when color/side actually changes, NOT fabricCanvas

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg p-2 md:p-6 min-h-0 md:pt-16 relative">
      <Button 
        variant="default" 
        size="default"
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white hidden lg:flex px-6 py-2.5 text-base font-semibold"
        onClick={() => setIsQuantityModalOpen(true)}
      >
        <DollarSign className="w-5 h-5 mr-2" />
        Next Step
      </Button>
      <div className="relative w-full max-w-full flex justify-center">
        <canvas 
          ref={canvasRef}
          className="border border-border rounded-lg shadow-lg bg-card max-w-full"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
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