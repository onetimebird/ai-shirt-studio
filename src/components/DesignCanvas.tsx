
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Canvas as FabricCanvas, FabricText, FabricImage } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { ZoomIn, ZoomOut, RotateCw, Copy, Trash2, Move, MousePointer, ShoppingCart, RefreshCw } from "lucide-react";
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
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantities, setQuantities] = useState<{ [size: string]: number }>({
    S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0, "4XL": 0, "5XL": 0
  });
  const [totalPrice, setTotalPrice] = useState(0);

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
      addText: (text: string = "Sample Text", options: any = {}) => {
        const textObj = new FabricText(text, {
          left: 150,
          top: 150,
          fontFamily: options.fontFamily || 'Arial',
          fontSize: options.fontSize || 24,
          fill: options.fill || (currentColor?.name === "White" || currentColor?.name === "Vintage White" || 
                currentColor?.name === "Yellow" || currentColor?.name === "Lime" || 
                currentColor?.name === "Pink" || currentColor?.name === "Light Blue" || 
                currentColor?.name === "Mint" || currentColor?.name === "Lavender" || 
                currentColor?.name === "Silver" || currentColor?.name === "Peach" || 
                currentColor?.name === "Heather Grey" || currentColor?.name === "Dusty Blue" || 
                currentColor?.name === "Coral" || currentColor?.name === "Sand" || 
                currentColor?.name === "Mustard" || currentColor?.name === "Gold" 
                ? '#000000' : '#FFFFFF'),
          // Text editing and interaction properties
          editable: true,
          selectable: true,
          moveable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          // Visual styling for controls
          cornerSize: 12,
          transparentCorners: false,
          cornerColor: '#4F46E5',
          cornerStyle: 'rect',
          borderColor: '#4F46E5',
          borderOpacityWhenMoving: 0.5,
          borderScaleFactor: 2,
          // Text-specific properties
          textAlign: options.textAlign || 'left',
          fontWeight: options.fontWeight || 'normal',
          fontStyle: options.fontStyle || 'normal',
          underline: options.underline || false,
          scaleX: options.scaleX || 1,
          scaleY: options.scaleY || 1,
          rotation: options.rotation || 0,
        });
        
        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
        setSelectedObject(textObj);
        onSelectedObjectChange?.(textObj);
        
        console.log("Text added with properties:", textObj);
        toast.success("Text added to design");
      },
      
      canvas: fabricCanvas,
      
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
              hasControls: true,
              hasBorders: true,
              cornerSize: 10,
              transparentCorners: false,
              cornerColor: '#4F46E5',
              borderColor: '#4F46E5',
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
      },

      updateSelectedTextProperty: (property: string, value: any) => {
        if (!selectedObject || (selectedObject.type !== "textbox" && selectedObject.type !== "text")) {
          console.log("No text selected or wrong type:", selectedObject?.type);
          return;
        }
        console.log("Updating text property:", property, "to", value);
        selectedObject.set(property, value);
        selectedObject.setCoords();
        fabricCanvas.renderAll();
        fabricCanvas.requestRenderAll();
      },

      clearSelection: () => {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        setSelectedObject(null);
        onSelectedObjectChange?.(null);
      },

      addImageFromUrl: (url: string) => {
        FabricImage.fromURL(url).then((img) => {
          const maxWidth = 200;
          const maxHeight = 200;
          const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
          
          img.set({
            left: 150,
            top: 150,
            scaleX: scale,
            scaleY: scale,
            hasControls: true,
            hasBorders: true,
            cornerSize: 10,
            transparentCorners: false,
            cornerColor: '#4F46E5',
            borderColor: '#4F46E5',
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          setSelectedObject(img);
          onSelectedObjectChange?.(img);
          toast.success("AI image added to design");
        });
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

  const handleCanvasZoomIn = () => {
    setCanvasZoom(prev => Math.min(prev * 1.2, 2));
  };

  const handleCanvasZoomOut = () => {
    setCanvasZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleCanvasResetZoom = () => {
    setCanvasZoom(1);
  };

  const calculateTotalPrice = (quantities: { [size: string]: number }) => {
    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    let pricePerItem = 12.99; // Base price
    
    // Volume discounts
    if (totalItems >= 50) pricePerItem = 9.99;
    else if (totalItems >= 25) pricePerItem = 10.99;
    else if (totalItems >= 12) pricePerItem = 11.99;
    
    return totalItems * pricePerItem;
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    const newQuantities = { ...quantities, [size]: Math.max(0, quantity) };
    setQuantities(newQuantities);
    setTotalPrice(calculateTotalPrice(newQuantities));
  };

  const getTotalItems = () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = () => {
    const totalItems = getTotalItems();
    if (totalItems === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    toast.success(`Proceeding to checkout with ${totalItems} items - $${totalPrice.toFixed(2)}`);
    // Here you would typically redirect to checkout or open payment modal
  };

  return (
    <div className="flex-1 bg-muted/30 p-6 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Canvas Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{currentSide === "front" ? "Front" : "Back"} Design</Badge>
            <Badge variant="outline">Design Zoom: {Math.round(zoom * 100)}%</Badge>
            <Badge variant="outline">View Zoom: {Math.round(canvasZoom * 100)}%</Badge>
          </div>
          
          {/* Canvas Controls */}
          <div className="flex items-center gap-2">
            {/* Design Canvas Zoom */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom out design area">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom} title="Reset design zoom">
                Fit
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom in design area">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* T-shirt View Zoom */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleCanvasZoomOut} title="Zoom out t-shirt view">
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCanvasResetZoom} title="Reset t-shirt zoom">
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCanvasZoomIn} title="Zoom in t-shirt view">
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
            
            {selectedObject && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.duplicateSelected()}
                  title="Duplicate element"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.rotateSelected()}
                  title="Rotate element"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.centerSelected()}
                  title="Center element"
                >
                  <Move className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.deleteSelected()}
                  title="Delete element"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Next Step Button */}
            <div className="w-px h-6 bg-border mx-2" />
            <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Next Step
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose Sizes & Quantities</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Bella Canvas 3001C - {selectedColor}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(quantities).map(([size, quantity]) => (
                        <div key={size} className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{size}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(size, quantity - 1)}
                              disabled={quantity === 0}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(size, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total ({getTotalItems()} items):</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Volume discounts applied automatically
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                      Back to Design
                    </Button>
                    <Button onClick={handleCheckout} className="flex-1">
                      Checkout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div 
            className="relative bg-card rounded-lg shadow-creative p-8 transition-transform duration-200"
            style={{ 
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center'
            }}
          >
            {/* T-shirt Background - Only apply color to the shirt */}
            <div className="absolute inset-8 flex items-center justify-center rounded-lg">
              {/* T-shirt mockup with color overlay */}
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  width: "500px",
                  height: "600px",
                }}
              >
                {/* Colored background for t-shirt */}
                <div 
                  className="absolute inset-0 transition-colors duration-300"
                  style={{
                    backgroundColor: currentColor?.value || "#ffffff",
                  }}
                />
                {/* T-shirt template image */}
                <img
                  src={tshirtImage}
                  alt={`T-shirt ${currentSide}`}
                  className="relative w-full h-full object-contain z-10"
                  style={{
                    filter: currentColor?.name === "White" ? "none" : `drop-shadow(0 0 0 ${currentColor?.value})`,
                    mixBlendMode: "overlay",
                  }}
                />
              </div>
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
                    className="relative border-2 border-dashed border-primary/30 rounded bg-transparent hover:border-primary/50 transition-colors"
                    style={{
                      width: "300px",
                      height: "350px",
                      marginTop: "80px",
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 rounded"
                      style={{
                        width: "300px",
                        height: "350px",
                      }}
                    />
                    {/* Design area label */}
                    {!selectedObject && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                          Design Area
                        </div>
                      </div>
                    )}
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
