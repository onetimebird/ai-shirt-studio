import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Canvas, Textbox, Control, controlsUtils, util as fabricUtil, FabricImage } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { ZoomIn, ZoomOut, RotateCw, Copy, Trash2, Move, MousePointer, ShoppingCart, RefreshCw } from "lucide-react";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";
import deleteSvg from "@/assets/icons/delete.svg";
import layerSvg from "@/assets/icons/layer.svg";
import cloneSvg from "@/assets/icons/clone.svg";
import stretchSvg from "@/assets/icons/stretch.svg";
import scaleSvg from "@/assets/icons/scale.svg";
import rotateSvg from "@/assets/icons/rotate.svg";

// Preload icons and patch prototype (module scope, before any React code)
(async () => {
  const [deleteImg, layerImg, cloneImg, stretchImg, scaleImg, rotateImg] = await Promise.all([
    fabricUtil.loadImage(deleteSvg),
    fabricUtil.loadImage(layerSvg),
    fabricUtil.loadImage(cloneSvg),
    fabricUtil.loadImage(stretchSvg),
    fabricUtil.loadImage(scaleSvg),
    fabricUtil.loadImage(rotateSvg),
  ]);

  // Create a helper to build a control with an icon
  function makeControl(icon: HTMLImageElement, handler: any, pos: { x:number,y:number }) {
    return new Control({
      x: pos.x, y: pos.y,
      cursorStyle: "pointer",
      actionHandler: handler,
      render(ctx, left, top, _, obj) {
        const size = Math.max(28, obj.getScaledHeight()*0.12);
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(obj.angle * Math.PI/180);
        // draw background
        ctx.beginPath();
        ctx.arc(0,0,size/2,0,2*Math.PI);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.strokeStyle = "#ddd"; ctx.stroke();
        // draw icon
        ctx.drawImage(icon, -size*0.3, -size*0.3, size*0.6, size*0.6);
        ctx.restore();
      }
    });
  }

  // Patch the Textbox prototype (still module–scope)
  Textbox.prototype.controls = {
    tl: makeControl(deleteImg,   (_e,t) => { t.target.canvas.remove(t.target); return true; }, { x:-0.5,y:-0.5 }),
    mt: makeControl(layerImg,    (_e,t) => { t.target.canvas.bringObjectToFront(t.target); return true; }, { x:  0 ,y:-0.5 }),
    tr: makeControl(cloneImg,    (_e,t) => { t.target.clone(c=>{ t.target.canvas.add(c).setActiveObject(c)}); return true; }, { x: 0.5,y:-0.5 }),
    mr: makeControl(stretchImg,  controlsUtils.scalingXOrSkewingY,   { x: 0.5,y:  0  }),
    br: makeControl(scaleImg,    controlsUtils.scalingEqually,      { x: 0.5,y: 0.5 }),
    bl: makeControl(rotateImg,   controlsUtils.rotationWithSnapping, { x:-0.5,y: 0.5 }),
    mtr:makeControl(rotateImg,   controlsUtils.rotationWithSnapping, { x:  0 ,y:-0.75}),
  };
  Textbox.prototype.objectCaching = false;
})();

interface DesignCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  activeTool: string;
  onSelectedObjectChange?: (obj: any) => void;
  onToolChange?: (tool: string) => void;
}

export const DesignCanvas = ({ 
  selectedColor, 
  currentSide, 
  activeTool, 
  onSelectedObjectChange,
  onToolChange
}: DesignCanvasProps) => {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [overlayBounds, setOverlayBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [isStretching, setIsStretching] = useState(false);
  const [isVerticalScaling, setIsVerticalScaling] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startScale, setStartScale] = useState({ x: 1, y: 1 });
  const [startPointer, setStartPointer] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [tool, setTool] = useState(activeTool);
  const [textObjects, setTextObjects] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantities, setQuantities] = useState<{ [size: string]: number }>({
    S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0, "4XL": 0, "5XL": 0
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = currentSide === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current) return;

    // Get wrapper dimensions for responsive canvas
    const { width, height } = canvasWrapperRef.current.getBoundingClientRect();

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "transparent",
      selection: true,
    });

    // Function to update text objects list
    const updateTextObjects = () => {
      const objects = canvas.getObjects();
      const texts = objects.filter((obj: any) => obj.type === "textbox" || obj.type === "text");
      setTextObjects(texts);
    };

    canvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
      
      // Switch to edit mode for text objects
      if (obj?.type === "textbox" || obj?.type === "text" || obj?.type === "i-text") {
        setTool("editText");
        onToolChange?.("editText");
      } else {
        setOverlayBounds(null);
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
      
      // Switch to edit mode for text objects
      if (obj?.type === "textbox" || obj?.type === "text" || obj?.type === "i-text") {
        setTool("editText");
        onToolChange?.("editText");
      } else {
        setOverlayBounds(null);
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      onSelectedObjectChange?.(null);
      setOverlayBounds(null);
      // Return to add text mode
      setTool("text");
      onToolChange?.("text");
    });

    // Track text objects
    canvas.on('object:added', updateTextObjects);
    canvas.on('object:removed', updateTextObjects);

    // Add keyboard event listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObj = canvas?.getActiveObject();
      if (!activeObj) return;

      const key = e.key;
      const step = e.shiftKey ? 10 : 1;

      switch(key) {
        case 'ArrowUp':
          e.preventDefault();
          activeObj.set('top', activeObj.top - step);
          break;
        case 'ArrowDown': 
          e.preventDefault();
          activeObj.set('top', activeObj.top + step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          activeObj.set('left', activeObj.left - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          activeObj.set('left', activeObj.left + step);
          break;
        case 'Enter':
          if (activeObj.type === 'textbox') {
            (activeObj as any).enterEditing?.();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (!(activeObj as any).isEditing) {
            canvas.remove(activeObj);
            canvas.discardActiveObject();
            setSelectedObject(null);
            setOverlayBounds(null);
            canvas.requestRenderAll();
            setTool("text");
            onToolChange?.("text");
            toast.success("Text deleted");
          }
          break;
      }
      canvas?.requestRenderAll();
    };

    document.addEventListener('keydown', handleKeyDown);

    setFabricCanvas(canvas);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, [currentSide, onSelectedObjectChange]);

  // Add text function
  const addText = (text: string = "Double-click to edit") => {
    if (!fabricCanvas) return;

    try {
      if (activeTool === "text") {
        const textObj = new Textbox(text, {
          left: 200,
          top: 150,
          width: 200,
          fontSize: 32,
          fill: "#000000",
          fontFamily: "Arial",
          textAlign: "center",
          splitByGrapheme: true,
        });

        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.requestRenderAll();

        setSelectedObject(textObj);
        onSelectedObjectChange?.(textObj);
        setTool("editText");
        onToolChange?.("editText");

        toast.success("Text added! Use the controls to customize it.");
      }
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text");
    }
  };

  // Add image function
  const addImage = (file: File) => {
    if (!fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        FabricImage.fromURL(e.target?.result as string).then((img) => {
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.requestRenderAll();
          toast.success("Image added!");
        }).catch((error) => {
          console.error("Error loading image:", error);
          toast.error("Failed to load image");
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add image from URL function
  const addImageFromURL = (url: string) => {
    if (!fabricCanvas) return;

    try {
      if (url) {
        FabricImage.fromURL(url).then((img) => {
          img.set({
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5,
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.requestRenderAll();
          toast.success("AI image added!");
        }).catch((error) => {
          console.error("Error loading AI image:", error);
          toast.error("Failed to load AI image");
        });
      }
    } catch (error) {
      console.error("Error adding AI image:", error);
      toast.error("Failed to add AI image");
    }
  };

  // Expose functions globally for external access
  useEffect(() => {
    (window as any).designCanvas = {
      canvas: fabricCanvas,
      addText,
      addImage,
      addImageFromURL,
      textObjects
    };
  }, [fabricCanvas, textObjects]);

  // Handle zoom
  const handleZoom = (direction: "in" | "out") => {
    if (!fabricCanvas) return;
    
    const factor = direction === "in" ? 1.2 : 0.8;
    const newZoom = canvasZoom * factor;
    
    if (newZoom >= 0.1 && newZoom <= 5) {
      fabricCanvas.setZoom(newZoom);
      setCanvasZoom(newZoom);
      fabricCanvas.requestRenderAll();
    }
  };

  const calculateTotal = () => {
    const basePrice = 15.99;
    const total = Object.values(quantities).reduce((sum, qty) => sum + (qty * basePrice), 0);
    setTotalPrice(total);
  };

  useEffect(() => {
    calculateTotal();
  }, [quantities]);

  const handleQuantityChange = (size: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, quantity)
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Canvas Controls Bar */}
      <div className="bg-card border-b border-border p-2 flex items-center gap-2 z-10">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleZoom("out")}
          className="h-8 px-2"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Badge variant="secondary" className="text-xs px-2 py-1 min-w-[4rem] text-center">
          {Math.round(canvasZoom * 100)}%
        </Badge>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleZoom("in")}
          className="h-8 px-2"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-2" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => addText()}
          className="h-8 px-3 text-xs"
        >
          Add Text
        </Button>

        <div className="flex-1" />

        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 px-3 text-xs">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Order Now
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Your Design</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bella + Canvas 3001C - {selectedColor}</h3>
                <p className="text-sm text-muted-foreground">Unisex Jersey Short Sleeve Tee</p>
              </div>

              <div className="space-y-3">
                {Object.entries(quantities).map(([size, qty]) => (
                  <div key={size} className="flex items-center justify-between">
                    <Label className="w-12">{size}</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(size, qty - 1)}
                        className="h-8 w-8 p-0"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={qty}
                        onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center"
                        min="0"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(size, qty + 1)}
                        className="h-8 w-8 p-0"
                      >
                        +
                      </Button>
                      <span className="text-sm w-16 text-right">
                        ${(qty * 15.99).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full">
                Add to Cart - ${totalPrice.toFixed(2)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasWrapperRef}
          className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20"
        >
          {/* T-shirt Background */}
          <div 
            className="relative bg-white rounded-lg shadow-lg"
            style={{
              width: Math.min(500, canvasWrapperRef.current?.offsetWidth || 500),
              height: Math.min(600, canvasWrapperRef.current?.offsetHeight || 600),
              backgroundImage: `url(${tshirtImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              filter: currentColor?.name !== "White" ? "none" : "none"
            }}
          >
            {/* Design Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full rounded-lg"
              style={{ 
                top: currentSide === "front" ? "15%" : "20%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "40%",
                height: "50%",
                maxWidth: "200px",
                maxHeight: "300px"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};