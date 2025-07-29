import { useEffect, useRef, useState } from "react";
import { getColorByName } from "@/data/gildan2000Colors";
import { Button } from "@/components/ui/button";
import { QuantityModal } from "@/components/QuantityModal";
import { DollarSign } from "lucide-react";

interface ProductCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  selectedProduct: string;
  onCanvasReady?: (canvas: any) => void;
}

interface OverlayElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  width?: number;
  height?: number;
}

export const ProductCanvas = ({ selectedColor, currentSide, selectedProduct, onCanvasReady }: ProductCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayElements, setOverlayElements] = useState<OverlayElement[]>([]);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>("");

  // Set up global canvas API for compatibility with existing code
  useEffect(() => {
    const mockCanvas = {
      add: (element: any) => {
        console.log("Adding element:", element);
        if (element.type === 'textbox' || element.type === 'text') {
          const newElement: OverlayElement = {
            id: Date.now().toString(),
            type: 'text',
            content: element.text || 'New Text',
            x: element.left || 300,
            y: element.top || 350,
            fontSize: element.fontSize || 24,
            color: element.fill || '#000000',
            fontFamily: element.fontFamily || 'Arial'
          };
          setOverlayElements(prev => [...prev, newElement]);
        } else if (element.type === 'image') {
          const newElement: OverlayElement = {
            id: Date.now().toString(),
            type: 'image',
            content: element.src || '',
            x: element.left || 300,
            y: element.top || 350,
            width: element.width || 200,
            height: element.height || 200
          };
          setOverlayElements(prev => [...prev, newElement]);
        }
      },
      renderAll: () => {
        console.log("Render all called");
      },
      setActiveObject: () => {},
      bringObjectToFront: () => {},
      getObjects: () => overlayElements
    };

    (window as any).designCanvas = {
      canvas: mockCanvas,
      addImage: (file: File) => {
        console.log("addImage called with file:", file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const newElement: OverlayElement = {
            id: Date.now().toString(),
            type: 'image',
            content: result,
            x: 250,
            y: 300,
            width: 200,
            height: 200
          };
          setOverlayElements(prev => [...prev, newElement]);
          console.log("Image added to overlay successfully");
        };
        reader.readAsDataURL(file);
      },
      addImageFromUrl: (url: string) => {
        console.log("addImageFromUrl called with url:", url);
        const newElement: OverlayElement = {
          id: Date.now().toString(),
          type: 'image',
          content: url,
          x: 250,
          y: 300,
          width: 200,
          height: 200
        };
        setOverlayElements(prev => [...prev, newElement]);
        console.log("Image from URL added to overlay successfully");
      },
      deleteSelected: () => {
        // For now, just remove the last element
        setOverlayElements(prev => prev.slice(0, -1));
      }
    };

    onCanvasReady?.(mockCanvas);
  }, [onCanvasReady, overlayElements]);

  // Load background image when color or side changes
  useEffect(() => {
    const colorData = getColorByName(selectedColor);
    if (!colorData || !colorData.available) return;

    const imageUrl = currentSide === "front" ? colorData.frontImage : colorData.backImage;
    setBackgroundImage(imageUrl);
    console.log("Background image set:", imageUrl);
  }, [selectedColor, currentSide]);

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
      
      <div 
        ref={containerRef}
        className="relative w-full max-w-full flex justify-center"
        style={{ width: 600, height: 700 }}
      >
        {/* Background T-shirt Image */}
        {backgroundImage && (
          <img 
            src={backgroundImage}
            alt="T-shirt"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ maxWidth: '80%', maxHeight: '80%', margin: 'auto' }}
          />
        )}
        
        {/* Overlay Elements */}
        {overlayElements.map((element) => (
          <div
            key={element.id}
            className="absolute cursor-move"
            style={{
              left: element.x,
              top: element.y,
              fontSize: element.type === 'text' ? `${element.fontSize}px` : undefined,
              color: element.type === 'text' ? element.color : undefined,
              fontFamily: element.type === 'text' ? element.fontFamily : undefined,
              width: element.type === 'image' ? element.width : 'auto',
              height: element.type === 'image' ? element.height : 'auto',
              zIndex: 10
            }}
          >
            {element.type === 'text' ? (
              <span>{element.content}</span>
            ) : (
              <img 
                src={element.content} 
                alt="Overlay" 
                className="max-w-full h-auto"
                style={{ width: element.width, height: element.height }}
              />
            )}
          </div>
        ))}
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