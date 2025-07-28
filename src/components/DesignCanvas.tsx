
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Canvas as FabricCanvas, FabricText, FabricImage } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { ZoomIn, ZoomOut, RotateCw, Copy, Trash2, Move, MousePointer } from "lucide-react";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";

interface DesignCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  activeTool: string;
  onSelectedObjectChange?: (obj: any) => void;
}

export const DesignCanvas = ({ 
  selectedColor, 
  currentSide, 
  activeTool,
  onSelectedObjectChange 
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = currentSide === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: "transparent",
      selection: true,
    });

    // Add selection events
    canvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      onSelectedObjectChange?.(null);
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [currentSide, onSelectedObjectChange]);

  // Expose canvas methods globally
  useEffect(() => {
    if (!fabricCanvas || !window) return;

    // Expose canvas globally for tool access
    (window as any).designCanvas = {
      addText: (text: string = "Sample Text") => {
        const textObj = new FabricText(text, {
          left: 100,
          top: 100,
          fontFamily: 'Arial',
          fontSize: 24,
          fill: '#000000',
          editable: true,
        });
        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
        setSelectedObject(textObj);
        onSelectedObjectChange?.(textObj);
        toast.success("Text added to design");
      },
      
      addImage: (file: File) => {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image file");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          FabricImage.fromURL(e.target?.result as string).then((img) => {
            const maxWidth = 200;
            const maxHeight = 200;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
            
            img.set({
              left: 150,
              top: 150,
              scaleX: scale,
              scaleY: scale,
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            setSelectedObject(img);
            onSelectedObjectChange?.(img);
            toast.success("Image added to design");
          });
        };
        reader.readAsDataURL(file);
      },

      deleteSelected: () => {
        if (!selectedObject) return;
        fabricCanvas.remove(selectedObject);
        fabricCanvas.renderAll();
        setSelectedObject(null);
        onSelectedObjectChange?.(null);
        toast.success("Element deleted");
      },

      duplicateSelected: () => {
        if (!selectedObject) return;
        selectedObject.clone((cloned: any) => {
          cloned.set({
            left: selectedObject.left + 20,
            top: selectedObject.top + 20,
          });
          fabricCanvas.add(cloned);
          fabricCanvas.setActiveObject(cloned);
          fabricCanvas.renderAll();
          setSelectedObject(cloned);
          onSelectedObjectChange?.(cloned);
        });
        toast.success("Element duplicated");
      },

      rotateSelected: () => {
        if (!selectedObject) return;
        selectedObject.rotate(selectedObject.angle + 15);
        fabricCanvas.renderAll();
      },

      centerSelected: () => {
        if (!selectedObject) return;
        selectedObject.center();
        fabricCanvas.renderAll();
      }
    };

    return () => {
      delete (window as any).designCanvas;
    };
  }, [fabricCanvas, selectedObject, onSelectedObjectChange]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const handleResetZoom = () => {
    setZoom(1);
    fabricCanvas?.setZoom(1);
  };

  return (
    <div className="flex-1 bg-muted/30 p-6 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Canvas Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{currentSide === "front" ? "Front" : "Back"} Design</Badge>
            <Badge variant="outline">Zoom: {Math.round(zoom * 100)}%</Badge>
          </div>
          
          {/* Canvas Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              Fit
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {selectedObject && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.duplicateSelected()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.rotateSelected()}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.centerSelected()}
                >
                  <Move className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.deleteSelected()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative bg-card rounded-lg shadow-creative p-8">
            {/* T-shirt Background */}
            <div 
              className="absolute inset-8 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: currentColor?.value || "#ffffff",
                width: "500px",
                height: "600px",
              }}
            >
              <img
                src={tshirtImage}
                alt={`T-shirt ${currentSide}`}
                className="w-full h-full object-contain"
                style={{
                  filter: currentColor?.name !== "White" ? 
                    `brightness(0) saturate(100%) invert(${currentColor?.name === "Black" ? "0%" : "100%"})` : 
                    "none",
                }}
              />
            </div>

            {/* Design Area */}
            <div className="relative flex items-center justify-center">
              <div 
                className="relative"
                style={{
                  width: "500px",
                  height: "600px",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="relative border-2 border-dashed border-primary/30 rounded bg-transparent"
                    style={{
                      width: "300px",
                      height: "350px",
                      marginTop: "80px",
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0"
                      style={{
                        width: "300px",
                        height: "350px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Cursor Indicator */}
            {activeTool !== "products" && (
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <MousePointer className="w-3 h-3" />
                  {activeTool === "text" && "Click to add text"}
                  {activeTool === "upload" && "Upload an image"}
                  {activeTool === "clipart" && "Select clipart"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
