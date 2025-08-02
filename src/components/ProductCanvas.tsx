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
  const [showCenterGuide, setShowCenterGuide] = useState(false);

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
    
    // Add center guideline event handlers
    canvas.on('object:moving', () => {
      setShowCenterGuide(true);
    });
    
    canvas.on('object:modified', () => {
      setShowCenterGuide(false);
    });
    
    canvas.on('selection:cleared', () => {
      setShowCenterGuide(false);
    });
    
    canvas.on('mouse:up', () => {
      setShowCenterGuide(false);
    });
    
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
        
        {/* Center guideline and bounding box */}
        {showCenterGuide && fabricCanvas && (
          <>
            {/* Center vertical line */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: '2px',
                height: '100%',
                backgroundColor: '#10b981',
                transform: 'translateX(-50%)',
                zIndex: 100,
                pointerEvents: 'none',
                opacity: 0.8
              }}
            />
            
            {/* Printable area bounding box */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '25%',
                width: '45%',
                height: '50%',
                border: '2px dashed #3b82f6',
                transform: 'translateX(-50%)',
                zIndex: 99,
                pointerEvents: 'none',
                opacity: 0.7,
                borderRadius: '8px'
              }}
            />
            
            {/* Area labels */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '20%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(59, 130, 246, 0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                zIndex: 101,
                pointerEvents: 'none'
              }}
            >
              Centered
            </div>
            
            <div
              style={{
                position: 'absolute',
                left: '25%',
                top: '35%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                padding: '3px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '500',
                zIndex: 101,
                pointerEvents: 'none'
              }}
            >
              Left Chest
            </div>
          </>
        )}
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