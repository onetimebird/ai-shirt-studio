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
  const [productImage, setProductImage] = useState<FabricImage | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  // Initialize Fabric.js canvas
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

    // Don't overwrite designCanvas here - it will be set by DesignCanvas component
    // (window as any).designCanvas = { canvas };

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
    <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg p-2 md:p-6 min-h-0 md:pt-16">
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
        <div className="absolute top-6 right-6 z-10">
          <Button 
            variant="default" 
            size="default"
            className="bg-blue-500 hover:bg-blue-600 text-white hidden lg:flex px-6 py-2.5 text-base font-semibold"
            onClick={() => setIsQuantityModalOpen(true)}
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Next Step
          </Button>
        </div>
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