
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Canvas, IText, Control, controlsUtils, util, Textbox, FabricImage } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { ZoomIn, ZoomOut, RotateCw, Copy, Trash2, Move, MousePointer, ShoppingCart, RefreshCw } from "lucide-react";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";
import deleteIcon from "@/assets/icons/delete.svg";
import cloneIcon from "@/assets/icons/clone.svg";
import rotateIcon from "@/assets/icons/rotate.svg";
import scaleIcon from "@/assets/icons/scale.svg";
import stretchIcon from "@/assets/icons/stretch.svg";
import layerIcon from "@/assets/icons/layer.svg";

// Patch IText prototype at module level before any instances are created
(async () => {
  const [del, clo, rot, sca, str, lay] = await Promise.all([
    util.loadImage(deleteIcon),
    util.loadImage(cloneIcon),
    util.loadImage(rotateIcon),
    util.loadImage(scaleIcon),
    util.loadImage(stretchIcon),
    util.loadImage(layerIcon),
  ]);

  const mk = (img: HTMLImageElement, handler: any, pos: { x: number; y: number }) =>
    new Control({
      x: pos.x, y: pos.y,
      actionHandler: handler,
      cursorStyle: "pointer",
      render(ctx, left, top, styleOverride, obj) {
        const size = Math.max(28, obj.getScaledHeight() * 0.12);
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate((obj.angle * Math.PI)/180);
        ctx.beginPath();
        ctx.arc(0,0,size/2,0,2*Math.PI);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.strokeStyle = "#ddd"; ctx.stroke();
        ctx.drawImage(img, -size*0.3, -size*0.3, size*0.6, size*0.6);
        ctx.restore();
      }
    });

  const delH = (_e: any, t: any) => { t.target.canvas.remove(t.target); return true; };
  const layH = (_e: any, t: any) => { t.target.canvas.bringObjectToFront(t.target); return true; };
  const cloH = (_e: any, t: any) => { t.target.clone((c: any) => { t.target.canvas.add(c).setActiveObject(c); }); return true; };

  IText.prototype.controls = {
    tl: mk(del, delH, {x:-0.5,y:-0.5}),
    mt: mk(lay, layH, {x:0,   y:-0.5}),
    tr: mk(clo, cloH, {x: 0.5,y:-0.5}),
    mr: mk(str, controlsUtils.scalingXOrSkewingY, {x:0.5,y:0}),
    br: mk(sca, controlsUtils.scalingEqually,     {x:0.5,y:0.5}),
    bl: mk(rot, controlsUtils.rotationWithSnapping,{x:-0.5,y:0.5}),
    mtr:mk(rot, controlsUtils.rotationWithSnapping,{x:0,   y:-0.75}),
  };

  IText.prototype.objectCaching = false;
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

  // Scale sensitivity for smooth, controlled scaling
  const DIAG_DIV = 150; // Adjust for scaling speed - smaller = faster scaling

  // Utility: project pointer movement along diagonal
  function getProjectedDrag(
    startX: number, startY: number,
    currX: number, currY: number
  ) {
    // project the delta onto the [1,1] diagonal
    const dx = currX - startX;
    const dy = currY - startY;
    const invSqrt2 = 1/Math.sqrt(2);
    return dx * invSqrt2 + dy * invSqrt2;
  }

  // Exponential sensitivity divisor
  const EXP_DIV = 200; // larger = slower, smaller = snappier

  // Uniform scale handler
  const onScaleStart = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;

    const { left, top, width, height, scaleX: initSX, scaleY: initSY } = obj;
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = rect.left + left + width/2;
    const cy = rect.top + top + height/2;
    const startX = e.clientX, startY = e.clientY;

    const onMove = (m: PointerEvent) => {
      const drag = getProjectedDrag(startX, startY, m.clientX, m.clientY);
      // exponential factor: exp(drag/EXP_DIV)
      const factor = Math.exp(drag/EXP_DIV);
      obj.set({
        scaleX: initSX! * factor,
        scaleY: initSY! * factor
      });
      fabricCanvas.requestRenderAll();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Horizontal stretch handler
  const onStretchStart = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;

    const { left, top, width, height, scaleX: initSX } = obj;
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = rect.left + left + width/2;
    const cy = rect.top + top + height/2;
    const startX = e.clientX, startY = e.clientY;

    const onMove = (m: PointerEvent) => {
      const drag = getProjectedDrag(startX, startY, m.clientX, m.clientY);
      const factorX = Math.exp(drag/EXP_DIV);
      obj.set({ scaleX: initSX! * factorX });
      fabricCanvas.requestRenderAll();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Vertical stretch handler (arrow up/down)
  const onVerticalScaleStart = (e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;

    const { left, top, width, height, scaleY: initSY } = obj;
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = rect.left + left + width/2;
    const cy = rect.top + top + height/2;
    const startX = e.clientX, startY = e.clientY;

    const onMove = (m: PointerEvent) => {
      const drag = getProjectedDrag(startX, startY, m.clientX, m.clientY);
      const factorY = Math.exp(drag/EXP_DIV);
      obj.set({ scaleY: initSY! * factorY });
      fabricCanvas.requestRenderAll();
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantities, setQuantities] = useState<{ [size: string]: number }>({
    S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0, "4XL": 0, "5XL": 0
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = currentSide === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    // 1. Verify SVG URLs resolve to images
    console.log("deleteIcon URL is", deleteIcon);
    const testImg = new Image();
    testImg.onload  = () => console.log("✅ deleteIcon loaded OK", testImg.width, testImg.height);
    testImg.onerror = () => console.error("❌ deleteIcon failed to load");
    testImg.src     = deleteIcon;

    if (!canvasRef.current || !canvasWrapperRef.current) return;

    // Get wrapper dimensions for responsive canvas
    const { width, height } = canvasWrapperRef.current.getBoundingClientRect();

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "transparent",
      selection: true,
    });

    // Add selection events - Simple approach without custom controls
    // Function to update text objects list
    const updateTextObjects = () => {
      const objects = canvas.getObjects();
      const texts = objects.filter((obj: any) => obj.type === "textbox" || obj.type === "text");
      setTextObjects(texts);
    };

    // Listen to all transform events for sticky overlay handles
    const events = ['selection:created', 'selection:updated', 'object:moving', 'object:scaling', 'object:rotating'];
    events.forEach(evt => {
      canvas.on(evt as any, ({ target }: any) => {
        // Only update bounds for non-text objects since text uses custom controls
        if (target && target.type !== 'textbox' && target.type !== 'text') {
          // Handle other object types if needed
        }
      });
    });

    canvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
      
      // Switch to edit mode for text objects
      if (obj?.type === "textbox" || obj?.type === "text" || obj?.type === "i-text") {
        setTool("editText");
        onToolChange?.("editText");
        // Don't hide controls anymore - use custom ones
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

    
    // Add keyboard event listener to document for better handling
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObj = fabricCanvas?.getActiveObject();
      if (!activeObj) return;

      const key = e.key;
      const step = e.shiftKey ? 10 : 1; // Shift = 10px, normal = 1px

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
      canvas.off('selection:created');
      canvas.off('selection:updated');
      canvas.off('selection:cleared');
      canvas.off('object:modified');
      canvas.off('object:moving');
      canvas.off('object:scaling');
      canvas.off('object:rotating');
      canvas.dispose();
    };
  }, [currentSide, onSelectedObjectChange]);


  // Add pointer event handlers for interactions
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!selectedObject || !fabricCanvas) return;
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      if (isRotating) {
        const center = selectedObject.getCenterPoint();
        const cx = rect.left + center.x;
        const cy = rect.top + center.y;
        const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
        const startAngleRad = Math.atan2(startPointer.y - cy, startPointer.x - cx);
        const degrees = startAngle + (currentAngle - startAngleRad) * (180 / Math.PI);
        
        selectedObject.rotate(degrees);
        fabricCanvas.requestRenderAll();
        
        // Update overlay bounds
        const bounds = selectedObject.getBoundingRect();
        setOverlayBounds({
          x: bounds.left,
          y: bounds.top,
          width: bounds.width,
          height: bounds.height
        });
      }
      
      if (isScaling) {
        const center = selectedObject.getCenterPoint();
        const cx = rect.left + center.x;
        const cy = rect.top + center.y;
        
        const currentDist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const startDist = Math.hypot(startPointer.x - cx, startPointer.y - cy);
        
        if (startDist > 0) {
          const rawFactor = currentDist / Math.max(startDist, 1);
          const factor = 1 + (rawFactor - 1) * 0.1; // Use diagonal projection method
          
          selectedObject.set({
            scaleX: startScale.x * factor,
            scaleY: startScale.y * factor
          });
          fabricCanvas.requestRenderAll();
          
          // Update overlay bounds
          const newBounds = selectedObject.getBoundingRect();
          setOverlayBounds({
            x: newBounds.left,
            y: newBounds.top,
            width: newBounds.width,
            height: newBounds.height
          });
        }
      }
      
      if (isStretching) {
        const center = selectedObject.getCenterPoint();
        const cx = rect.left + center.x;
        const cy = rect.top + center.y;
        
        const currentDist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const startDist = Math.hypot(startPointer.x - cx, startPointer.y - cy);
        
        if (startDist > 0) {
          const rawFactor = currentDist / Math.max(startDist, 1);
          const factorX = 1 + (rawFactor - 1) * 0.1; // Use diagonal projection method
          
          selectedObject.set({
            scaleX: startScale.x * factorX
          });
          fabricCanvas.requestRenderAll();
          
          // Update overlay bounds
          const bounds = selectedObject.getBoundingRect();
          setOverlayBounds({
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
          });
        }
      }

      if (isVerticalScaling) {
        const center = selectedObject.getCenterPoint();
        const cx = rect.left + center.x;
        const cy = rect.top + center.y;
        
        const currentDistY = Math.abs(e.clientY - cy);
        const startDistY = Math.abs(startPointer.y - cy);
        
        if (startDistY > 0) {
          const rawFactor = currentDistY / Math.max(startDistY, 1);
          const factorY = 1 + (rawFactor - 1) * 0.1; // Use diagonal projection method
          
          selectedObject.set({
            scaleY: startScale.y * factorY
          });
          fabricCanvas.requestRenderAll();
          
          // Update overlay bounds
          const bounds = selectedObject.getBoundingRect();
          setOverlayBounds({
            x: bounds.left,
            y: bounds.top,
            width: bounds.width,
            height: bounds.height
          });
        }
      }
    };
    
    const handlePointerUp = () => {
      setIsRotating(false);
      setIsScaling(false);
      setIsStretching(false);
      setIsVerticalScaling(false);
    };
    
    if (isRotating || isScaling || isStretching || isVerticalScaling) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isRotating, isScaling, isStretching, isVerticalScaling, selectedObject, fabricCanvas, startPointer, startScale, startAngle]);

  // Expose canvas methods globally
  useEffect(() => {
    if (!fabricCanvas || !window) return;

    // Expose canvas globally for tool access
    (window as any).designCanvas = {
      addText: (text: string = "New multi-line text\nType here...", options: any = {}) => {
        const textObj = new IText(text, {
          left: 200,
          top: 200,
          width: 300,
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
          objectCaching: false, // Disable caching for better icon rendering
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
        
        // Immediately select and switch to edit mode
        setTool("editText");
        onToolChange?.("editText");
        
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
        setSelectedObject(selectedObject);
        onSelectedObjectChange?.(selectedObject);
      },

      setRotation: (degrees: number) => {
        if (!selectedObject) return;
        selectedObject.rotate(degrees);
        fabricCanvas.renderAll();
        setSelectedObject(selectedObject);
        onSelectedObjectChange?.(selectedObject);
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
      },

      textObjects
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
                  title="Rotate"
                  className="hover:bg-primary/10"
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
            {/* T-shirt Background - REMOVED to prevent click interference */}

            {/* Design Area */}
            <div className="relative flex items-center justify-center">
              <div 
                ref={canvasWrapperRef}
                className="canvas-wrapper"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "600px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{ 
                    display: "block",
                    width: "100%", 
                    height: "100%" 
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
        </div>
      </div>
    );
  };

export default DesignCanvas;
