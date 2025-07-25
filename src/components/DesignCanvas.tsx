import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Image as ImageIcon, Move, RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

export const DesignCanvas = ({ side, elements, onElementsChange }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newText, setNewText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const addTextElement = () => {
    if (!newText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: "text",
      content: newText,
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      rotation: 0,
      fontSize: 24,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
    };

    onElementsChange([...elements, newElement]);
    setNewText("");
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
        x: 50,
        y: 50,
        width: 150,
        height: 150,
        rotation: 0,
      };

      onElementsChange([...elements, newElement]);
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

  const handleElementClick = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

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
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteElement(selectedEl.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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

      {/* Design Canvas */}
      <div 
        ref={canvasRef}
        className="relative w-80 h-96 mx-auto bg-white/10 border-2 border-dashed border-border rounded-lg overflow-hidden"
        style={{ aspectRatio: "4/5" }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-pointer border-2 ${
              selectedElement === element.id ? "border-primary" : "border-transparent"
            } hover:border-primary/50 transition-colors`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
            }}
            onClick={() => handleElementClick(element.id)}
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
                className="w-full h-full object-contain"
                draggable={false}
              />
            )}
          </div>
        ))}
        
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Add text or images to start designing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};