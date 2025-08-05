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
  const [tshirtDimensions, setTshirtDimensions] = useState({ top: 0, scale: 1, height: 0 });

  // Initialize Fabric.js canvas ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current) return;

    // Calculate larger canvas dimensions to accommodate full t-shirt
    const isMobile = window.innerWidth < 768;
    const canvasWidth = isMobile ? Math.min(400, window.innerWidth - 20) : 1012; // Reduced by 12% from 1150
    const canvasHeight = isMobile ? Math.min(500, (window.innerHeight - 200)) : 1113; // Reduced by 12% from 1265

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
      // Increased scale factor by 15% for mobile only - was 0.8625, now 0.99 (0.8625 * 1.15)
      const scaleFactor = isMobile ? 0.99 : 0.7;
      
      const scaleX = (canvasWidth * scaleFactor) / (img.width || 1);
      const scaleY = (canvasHeight * scaleFactor) / (img.height || 1);
      const scale = Math.min(scaleX, scaleY);

      // Set as background image - this keeps it behind all user content
      // Center the t-shirt properly within the smaller scale
      const topPosition = canvasHeight / 2;
      
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
      
      // Store t-shirt dimensions for bounding box positioning
      setTshirtDimensions({
        top: topPosition - (img.height * scale / 2),
        scale: scale,
        height: img.height
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
    <div className="flex-1 flex items-center justify-center relative max-h-full">
      <div className="relative w-full h-full flex items-center justify-center max-h-full">
        {/* NO <img> here—Fabric is already drawing the shirt as a background */}
        <canvas 
          ref={canvasRef}
          id="design-canvas"
          className="max-w-full max-h-full"
          style={{ 
            position: 'relative',
            zIndex: 50,
            pointerEvents: 'auto',
            backgroundColor: 'transparent',
            maxWidth: '100%',
            maxHeight: '100%',
            height: 'auto',
            cursor: 'default'
          }}
        />
        
        {/* Center guideline and bounding box */}
        {showCenterGuide && fabricCanvas && (
          <>
            {/* Center vertical line - only within shirt area */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.08)) / (fabricCanvas?.height || 1)) * 100}%`,
                width: window.innerWidth >= 768 ? '3px' : '1px',
                height: `${((tshirtDimensions.height * tshirtDimensions.scale * 0.85) / (fabricCanvas?.height || 1)) * 100}%`,
                backgroundColor: '#22c55e',
                transform: 'translateX(-50%)',
                zIndex: 100,
                pointerEvents: 'none',
                opacity: 0.8
              }}
            />
            
            {/* Main Adult printable area bounding box - extended from collar to bottom */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.15)) / (fabricCanvas?.height || 1)) * 100}%`,
                width: '36%',
                height: '50%',
                border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
                transform: 'translateX(-50%)',
                zIndex: 99,
                pointerEvents: 'none',
                opacity: 0.8,
                borderRadius: '4px'
              }}
            />
            
            {/* Left Chest area box - positioned on wearer's left (viewer's right) */}
            <div
              style={{
                position: 'absolute',
                left: '60%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.15)) / (fabricCanvas?.height || 1)) * 100}%`,
                width: '14%',
                height: '12%',
                border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
                transform: 'translateX(-50%)',
                zIndex: 100,
                pointerEvents: 'none',
                opacity: 0.8,
                borderRadius: '3px'
              }}
            />
            
            {/* Youth size area indicator - larger and starting near collar */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.18)) / (fabricCanvas?.height || 1)) * 100}%`,
                width: '32%',
                height: '34%',
                border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
                transform: 'translateX(-50%)',
                zIndex: 98,
                pointerEvents: 'none',
                opacity: 0.7,
                borderRadius: '4px'
              }}
            />
            
            <div
              style={{
                position: 'absolute',
                left: '60%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.15)) / (fabricCanvas?.height || 1)) * 100}%`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '8px',
                fontSize: window.innerWidth >= 768 ? '18px' : '7px',
                fontWeight: window.innerWidth >= 768 ? '600' : '400',
                zIndex: 101,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
            >
              Left Chest
            </div>
            
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.65)) / (fabricCanvas?.height || 1)) * 100}%`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '8px',
                fontSize: window.innerWidth >= 768 ? '18px' : '7px',
                fontWeight: window.innerWidth >= 768 ? '600' : '400',
                zIndex: 101,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
            >
              Youth
            </div>
            
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.85)) / (fabricCanvas?.height || 1)) * 100}%`,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to right, #3b82f6, #2563eb)',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '8px',
                fontSize: window.innerWidth >= 768 ? '18px' : '7px',
                fontWeight: window.innerWidth >= 768 ? '600' : '400',
                zIndex: 101,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] md:px-3 md:py-1 md:min-w-[75px]"
            >
              Adult
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