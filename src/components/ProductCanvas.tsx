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
  decorationMethod?: "screen-print" | "embroidery";
}

export const ProductCanvas = ({ selectedColor, currentSide, selectedProduct, onCanvasReady, decorationMethod }: ProductCanvasProps) => {
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
    const canvasWidth = isMobile ? Math.min(420, window.innerWidth - 10) : 1012; // Increased mobile width slightly
    const canvasHeight = isMobile ? Math.min(600, (window.innerHeight - 150)) : 1113; // Increased mobile height to prevent cutoff

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
      // Keep mobile unchanged at 1.05, desktop at 0.79
      let scaleFactor = isMobile ? 1.05 : 0.79;
      // Scale down back images by 10% on desktop only
      if (!isMobile && currentSide === "back") {
        scaleFactor *= 0.9;
      }
      
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
                top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.06)) / (fabricCanvas?.height || 1)) * 100}%`,
                width: window.innerWidth >= 768 ? '3px' : '1px',
                height: `${((tshirtDimensions.height * tshirtDimensions.scale * 0.90) / (fabricCanvas?.height || 1)) * 100}%`,
                backgroundColor: '#22c55e',
                transform: 'translateX(-50%)',
                zIndex: 100,
                pointerEvents: 'none',
                opacity: 0.8
              }}
            />
            
            {/* Front side bounding boxes */}
            {currentSide === "front" && decorationMethod === "embroidery" && (
              /* EMBROIDERY - Only Left Chest area box */
              <div
                style={{
                  position: 'absolute',
                  left: '60%',
                  top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.20)) / (fabricCanvas?.height || 1)) * 100}%`,
                  width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.16) / (fabricCanvas?.width || 1) * 100}%`,
                  height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.14 * 1.15 : 0.14)) / (fabricCanvas?.height || 1) * 100}%`,
                  border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
                  transform: 'translateX(-50%)',
                  zIndex: 100,
                  pointerEvents: 'none',
                  opacity: 0.8,
                  borderRadius: '3px'
                }}
              />
            )}
            
            {currentSide === "front" && decorationMethod !== "embroidery" && (
              <>
                {/* SCREEN-PRINT - Main Adult printable area bounding box - scales with t-shirt size */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.20)) / (fabricCanvas?.height || 1)) * 100}%`,
                    width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.42) / (fabricCanvas?.width || 1) * 100}%`,
                    height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.55 * 1.15 : 0.55)) / (fabricCanvas?.height || 1) * 100}%`,
                    border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
                    transform: 'translateX(-50%)',
                    zIndex: 99,
                    pointerEvents: 'none',
                    opacity: 0.8,
                    borderRadius: '4px'
                  }}
                />
                
                {/* SCREEN-PRINT - Left Chest area box - positioned on wearer's left (viewer's right) - scales with t-shirt */}
                <div
                  style={{
                    position: 'absolute',
                    left: '60%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.20)) / (fabricCanvas?.height || 1)) * 100}%`,
                    width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.16) / (fabricCanvas?.width || 1) * 100}%`,
                    height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.14 * 1.15 : 0.14)) / (fabricCanvas?.height || 1) * 100}%`,
                    border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    pointerEvents: 'none',
                    opacity: 0.8,
                    borderRadius: '3px'
                  }}
                />
                
                {/* SCREEN-PRINT - Youth size area indicator - scales with t-shirt */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.23)) / (fabricCanvas?.height || 1)) * 100}%`,
                    width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.38) / (fabricCanvas?.width || 1) * 100}%`,
                    height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.40 * 1.15 : 0.40)) / (fabricCanvas?.height || 1) * 100}%`,
                    border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
                    transform: 'translateX(-50%)',
                    zIndex: 98,
                    pointerEvents: 'none',
                    opacity: 0.7,
                    borderRadius: '4px'
                  }}
                />
              </>
            )}
            
            {/* Back side bounding boxes */}
            {currentSide === "back" && (
              <>
                {/* BACK - Main Adult printable area - shirt body width, collar to shirt end */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.06)) / (fabricCanvas?.height || 1)) * 100}%`,
                    width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.45) / (fabricCanvas?.width || 1) * 100}%`,
                    height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.70 * 1.15 : 0.70)) / (fabricCanvas?.height || 1) * 100}%`,
                    border: window.innerWidth >= 768 ? '3px solid #60a5fa' : '1px solid #60a5fa',
                    transform: 'translateX(-50%)',
                    zIndex: 99,
                    pointerEvents: 'none',
                    opacity: 0.8,
                    borderRadius: '4px'
                  }}
                />
                
                {/* BACK - Youth size area indicator - shirt body width, starts lower */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.16)) / (fabricCanvas?.height || 1)) * 100}%`,
                    width: `${(tshirtDimensions.height * tshirtDimensions.scale * 0.38) / (fabricCanvas?.width || 1) * 100}%`,
                    height: `${(tshirtDimensions.height * tshirtDimensions.scale * (window.innerWidth < 768 ? 0.35 * 1.15 : 0.35)) / (fabricCanvas?.height || 1) * 100}%`,
                    border: window.innerWidth >= 768 ? '2px dashed #60a5fa' : '1px dashed #60a5fa',
                    transform: 'translateX(-50%)',
                    zIndex: 98,
                    pointerEvents: 'none',
                    opacity: 0.7,
                    borderRadius: '4px'
                  }}
                />
              </>
            )}
            
            {/* Labels - conditional based on side and decoration method */}
            {/* EMBROIDERY - Only Left Chest label */}
            {currentSide === "front" && decorationMethod === "embroidery" && (
              <div
                style={{
                  position: 'absolute',
                  left: '60%',
                  top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.18)) / (fabricCanvas?.height || 1)) * 100}%`,
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
            )}
            
            {/* SCREEN-PRINT - Front labels */}
            {currentSide === "front" && decorationMethod !== "embroidery" && (
              <>
                {/* Left Chest label */}
                <div
                  style={{
                    position: 'absolute',
                    left: '60%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.18)) / (fabricCanvas?.height || 1)) * 100}%`,
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
                
                {/* Youth label */}
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
                
                {/* SCREEN-PRINT - Adult label */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * 0.72)) / (fabricCanvas?.height || 1)) * 100}%`,
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
            
            {/* BACK side labels */}
            {currentSide === "back" && (
              <>
                {/* BACK - Youth label positioned at bottom of youth box */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * (0.16 + (window.innerWidth < 768 ? 0.35 * 1.15 : 0.35)))) / (fabricCanvas?.height || 1)) * 100}%`,
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
                
                {/* BACK - Adult label positioned at bottom of adult box */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: `${((tshirtDimensions.top + (tshirtDimensions.height * tshirtDimensions.scale * (0.06 + (window.innerWidth < 768 ? 0.70 * 1.15 : 0.70)))) / (fabricCanvas?.height || 1)) * 100}%`,
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