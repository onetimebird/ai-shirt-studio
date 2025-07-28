import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Image as ImageIcon, Move, RotateCw, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";

interface DesignElement {
  id: string;
  type: "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface DesignCanvasProps {
  side: "front" | "back";
  elements: DesignElement[];
  onElementsChange: (elements: DesignElement[]) => void;
  selectedColor?: string;
}

const FONTS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Helvetica", value: "Helvetica, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Playfair Display", value: "Playfair Display, serif" },
  { name: "Oswald", value: "Oswald, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
];

export const DesignCanvas = ({ side, elements, onElementsChange, selectedColor = "White" }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });

  const addTextElement = () => {
    if (!newText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: "text",
      content: newText,
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      fontSize: 24,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
    };

    onElementsChange([...elements, newElement]);
    setNewText("");
    setSelectedElement(newElement.id);
    toast.success("Text added to design");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const newElement: DesignElement = {
        id: Date.now().toString(),
        type: "image",
        content: imageUrl,
        x: 100,
        y: 100,
        width: 120,
        height: 120,
        rotation: 0,
      };

      onElementsChange([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success("Image added to design");
    };
    reader.readAsDataURL(file);
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    const updatedElements = elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    onElementsChange(updatedElements);
  };

  const deleteElement = (id: string) => {
    const updatedElements = elements.filter(el => el.id !== id);
    onElementsChange(updatedElements);
    setSelectedElement(null);
    toast.success("Element deleted");
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setElementStart({ x: element.x, y: element.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    updateElement(selectedElement, {
      x: Math.max(0, Math.min(300, elementStart.x + deltaX)),
      y: Math.max(0, Math.min(350, elementStart.y + deltaY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const scaleElement = (elementId: string, scaleFactor: number) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newWidth = Math.max(20, Math.min(250, element.width * scaleFactor));
    const newHeight = Math.max(20, Math.min(250, element.height * scaleFactor));
    
    updateElement(elementId, { width: newWidth, height: newHeight });
  };

  const selectedEl = elements.find(el => el.id === selectedElement);
  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = side === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Design Tools - {side === "front" ? "Front" : "Back"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Text */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter text to add"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
            />
            <Button onClick={addTextElement} size="sm">
              <Type className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Image */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>

          {/* Element Properties */}
          {selectedEl && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">Edit {selectedEl.type}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => scaleElement(selectedEl.id, 0.8)}
                    title="Scale down"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => scaleElement(selectedEl.id, 1.2)}
                    title="Scale up"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteElement(selectedEl.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {selectedEl.type === "text" && (
                <>
                  <Input
                    value={selectedEl.content}
                    onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                    placeholder="Text content"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={selectedEl.fontFamily}
                      onValueChange={(value) => updateElement(selectedEl.id, { fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={selectedEl.fontSize}
                      onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                      placeholder="Size"
                      min="8"
                      max="72"
                    />
                  </div>
                  <Input
                    type="color"
                    value={selectedEl.color}
                    onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                    className="w-20"
                  />
                </>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateElement(selectedEl.id, { rotation: (selectedEl.rotation + 15) % 360 })}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Canvas with T-shirt */}
      <div className="relative w-80 h-96 mx-auto">
        {/* T-shirt background */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: currentColor?.value || "#ffffff",
          }}
        >
          <img
            src={tshirtImage}
            alt={`T-shirt ${side}`}
            className="w-full h-full object-contain"
            style={{
              filter: `hue-rotate(${currentColor?.name === "White" ? "0deg" : "180deg"})`,
            }}
          />
        </div>

        {/* Design area overlay */}
        <div 
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            // Design area is centered on the t-shirt
            top: "20%",
            left: "25%",
            width: "50%",
            height: "60%",
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-move border-2 transition-all ${
                selectedElement === element.id ? "border-primary shadow-glow" : "border-transparent hover:border-primary/50"
              }`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                transform: `rotate(${element.rotation}deg)`,
                zIndex: selectedElement === element.id ? 10 : 1,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            >
              {element.type === "text" ? (
                <div
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: element.fontSize,
                    color: element.color,
                    lineHeight: "1.2",
                    wordBreak: "break-word",
                    userSelect: "none",
                  }}
                  className="w-full h-full flex items-center justify-center text-center p-1"
                >
                  {element.content}
                </div>
              ) : (
                <img
                  src={element.content}
                  alt="Design element"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              )}
              
              {/* Resize handles */}
              {selectedElement === element.id && (
                <>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-background cursor-se-resize" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-background cursor-ne-resize" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-background cursor-sw-resize" />
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-background cursor-nw-resize" />
                </>
              )}
            </div>
          ))}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
              <div className="text-center">
                <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Add text or images</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};