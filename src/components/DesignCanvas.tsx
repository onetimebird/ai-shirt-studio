
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, FabricText, FabricImage } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";

interface DesignCanvasProps {
  side: "front" | "back";
  selectedColor?: string;
  onSelectedObjectChange?: (obj: any) => void;
  toolbarProps?: {
    newText: string;
    fontSize: number[];
    fontFamily: string;
    textColor: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    textAlign: string;
  };
}

export const DesignCanvas = ({ 
  side, 
  selectedColor = "White", 
  onSelectedObjectChange,
  toolbarProps 
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = side === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 500,
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
  }, [side, onSelectedObjectChange]);

  // Expose methods to parent component
  useEffect(() => {
    if (!fabricCanvas || !window) return;

    const addText = () => {
      if (!toolbarProps) return;
      
      const text = new FabricText(toolbarProps.newText, {
        left: 100,
        top: 100,
        fontFamily: toolbarProps.fontFamily,
        fontSize: toolbarProps.fontSize[0],
        fill: toolbarProps.textColor,
        fontWeight: toolbarProps.isBold ? 'bold' : 'normal',
        fontStyle: toolbarProps.isItalic ? 'italic' : 'normal',
        underline: toolbarProps.isUnderline,
        textAlign: toolbarProps.textAlign as any,
        editable: true,
      });

      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      fabricCanvas.renderAll();
      setSelectedObject(text);
      onSelectedObjectChange?.(text);
      toast.success("Text added to design");
    };

    const handleImageUpload = (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgElement = new Image();
        imgElement.onload = () => {
          FabricImage.fromURL(e.target?.result as string).then((img) => {
            const maxWidth = 200;
            const maxHeight = 200;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
            
            img.set({
              left: 100,
              top: 100,
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
        imgElement.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    };

    const deleteSelected = () => {
      if (!selectedObject) return;
      
      fabricCanvas.remove(selectedObject);
      fabricCanvas.renderAll();
      setSelectedObject(null);
      onSelectedObjectChange?.(null);
      toast.success("Element deleted");
    };

    const duplicateSelected = () => {
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
    };

    const rotateSelected = () => {
      if (!selectedObject) return;
      
      selectedObject.rotate(selectedObject.angle + 15);
      fabricCanvas.renderAll();
    };

    // Expose functions globally for toolbar access
    (window as any).designCanvas = {
      addText,
      handleImageUpload,
      deleteSelected,
      duplicateSelected,
      rotateSelected,
    };

    return () => {
      delete (window as any).designCanvas;
    };
  }, [fabricCanvas, selectedObject, toolbarProps, onSelectedObjectChange]);

  // Update text properties when changed
  useEffect(() => {
    if (!selectedObject || selectedObject.type !== 'text' || !toolbarProps) return;

    selectedObject.set({
      fontSize: toolbarProps.fontSize[0],
      fontFamily: toolbarProps.fontFamily,
      fill: toolbarProps.textColor,
      fontWeight: toolbarProps.isBold ? 'bold' : 'normal',
      fontStyle: toolbarProps.isItalic ? 'italic' : 'normal',
      underline: toolbarProps.isUnderline,
      textAlign: toolbarProps.textAlign,
    });

    fabricCanvas?.renderAll();
  }, [selectedObject, toolbarProps, fabricCanvas]);

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* T-shirt background */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{
            backgroundColor: currentColor?.value || "#ffffff",
            width: "400px",
            height: "500px",
          }}
        >
          <img
            src={tshirtImage}
            alt={`T-shirt ${side}`}
            className="w-full h-full object-contain"
            style={{
              filter: currentColor?.name !== "White" ? 
                `brightness(0) saturate(100%) invert(${currentColor?.name === "Black" ? "0%" : "100%"})` : 
                "none",
            }}
          />
        </div>

        {/* Design canvas overlay */}
        <div className="relative flex items-center justify-center">
          <div 
            className="relative"
            style={{
              width: "400px",
              height: "500px",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="relative border-2 border-dashed border-primary/30 rounded"
                style={{
                  width: "250px",
                  height: "300px",
                  marginTop: "50px",
                }}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0"
                  style={{
                    width: "250px",
                    height: "300px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
