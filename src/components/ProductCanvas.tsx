import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, FabricObject } from "fabric";
import { getColorByName } from "@/data/gildan2000Colors";
import { Button } from "@/components/ui/button";
import { QuantityModal } from "@/components/QuantityModal";
import { EmbroideryBoundingBox } from "@/components/EmbroideryBoundingBox";
import { ScreenPrintBoundingBox } from "@/components/ScreenPrintBoundingBox";
import { initializeTextControls, applyCustomControlsToObject } from "@/lib/fabricTextControls";
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
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const [tshirtDimensions, setTshirtDimensions] = useState({ top: 0, scale: 1, height: 0 });

  // Shared function to calculate canvas dimensions
  const calculateCanvasDimensions = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1280;
    
    if (isMobile) {
      return {
        width: Math.min(420, window.innerWidth - 10),
        height: Math.min(600, window.innerHeight - 150)
      };
    }
    
    // On desktop/tablet: calculate available space
    // Account for left sidebar (~280px) + right panel (320px on xl, 384px on 2xl) + padding
    const rightPanelWidth = window.innerWidth >= 1536 ? 384 : 320; // 2xl:w-96 vs w-80
    const leftSidebarWidth = 280;
    const padding = 32; // p-4 = 16px * 2
    
    const availableWidth = window.innerWidth - leftSidebarWidth - rightPanelWidth - padding;
    const maxWidth = Math.min(1012, Math.max(400, availableWidth)); // Keep within reasonable bounds
    
    return {
      width: maxWidth,
      height: Math.min(1113, window.innerHeight - 200)
    };
  };

  // Shared function to calculate t-shirt scale and position
  const calculateTshirtTransform = (img: FabricImage, canvasWidth: number, canvasHeight: number) => {
    const isMobile = canvasWidth < 500;
    let scaleFactor = isMobile ? 1.05 : 0.79;
    if (!isMobile && currentSide === "back") {
      scaleFactor *= 0.9;
    }
    
    const scaleX = (canvasWidth * scaleFactor) / (img.width || 1);
    const scaleY = (canvasHeight * scaleFactor) / (img.height || 1);
    const scale = Math.min(scaleX, scaleY);
    const topPosition = canvasHeight / 2;
    
    return {
      scale,
      topPosition,
      left: canvasWidth / 2,
      dimensions: {
        top: topPosition - (img.height * scale / 2),
        scale: scale,
        height: img.height
      }
    };
  };

  // Initialize Fabric.js canvas ONLY ONCE
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const { width: canvasWidth, height: canvasHeight } = calculateCanvasDimensions();

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
    
    canvas.on('mouse:up', () => {
      setShowCenterGuide(false);
    });

    // Initialize custom controls
    initializeTextControls();

    // Track selected object for custom controls
    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0];
        applyCustomControlsToObject(obj);
        setSelectedObject(obj);
        canvas.requestRenderAll();
      }
    });

    canvas.on('selection:updated', (e) => {
      if (e.selected && e.selected.length === 1) {
        const obj = e.selected[0];
        applyCustomControlsToObject(obj);
        setSelectedObject(obj);
        canvas.requestRenderAll();
      } else {
        setSelectedObject(null);
      }
    });

    canvas.on('selection:cleared', () => {
      setShowCenterGuide(false);
      setSelectedObject(null);
    });
    
    console.log('[ProductCanvas] Canvas created, calling onCanvasReady');
    onCanvasReady?.(canvas);
    console.log('[ProductCanvas] onCanvasReady called');

    // Add window resize listener to update canvas dimensions and rescale t-shirt
    const handleResize = () => {
      const { width: newWidth, height: newHeight } = calculateCanvasDimensions();
      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.setDimensions({ width: newWidth, height: newHeight });
        
        // Rescale the t-shirt background image to fit the new canvas size
        if (canvas.backgroundImage) {
          const img = canvas.backgroundImage as FabricImage;
          const transform = calculateTshirtTransform(img, newWidth, newHeight);
          
          img.set({
            scaleX: transform.scale,
            scaleY: transform.scale,
            left: transform.left,
            top: transform.topPosition,
          });
          
          // Update t-shirt dimensions for bounding boxes
          setTshirtDimensions(transform.dimensions);
        }
        
        canvas.renderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 700;
      
      // Use shared function to calculate t-shirt transform
      const transform = calculateTshirtTransform(img, canvasWidth, canvasHeight);
      
      img.set({
        scaleX: transform.scale,
        scaleY: transform.scale,
        originX: "center",
        originY: "center",
        left: transform.left,
        top: transform.topPosition,
        selectable: false,
        evented: false,
      });
      
      // Store t-shirt dimensions for bounding box positioning
      setTshirtDimensions(transform.dimensions);
      
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
            {console.log('[ProductCanvas] showCenterGuide is true, decorationMethod:', decorationMethod)}
            {decorationMethod === "embroidery" ? (
              <>
                {console.log('[ProductCanvas] RENDERING EMBROIDERY BOUNDING BOX')}
                <EmbroideryBoundingBox 
                  tshirtDimensions={tshirtDimensions}
                  canvasHeight={fabricCanvas.height || 1}
                  canvasWidth={fabricCanvas.width || 1}
                />
              </>
            ) : (
              <>
                {console.log('[ProductCanvas] RENDERING SCREEN PRINT BOUNDING BOX')}
                <ScreenPrintBoundingBox 
                  tshirtDimensions={tshirtDimensions}
                  canvasHeight={fabricCanvas.height || 1}
                  canvasWidth={fabricCanvas.width || 1}
                  currentSide={currentSide}
                />
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
        decorationMethod={decorationMethod}
      />
    </div>
  );
};