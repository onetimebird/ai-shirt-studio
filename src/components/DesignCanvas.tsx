import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Type, Image as ImageIcon, Trash2, RotateCw, Copy, AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { toast } from "sonner";
import { Canvas as FabricCanvas, FabricText, FabricImage, Circle } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";

interface DesignCanvasProps {
  side: "front" | "back";
  selectedColor?: string;
}

const FONTS = [
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Times New Roman", value: "Times New Roman" },
  { name: "Georgia", value: "Georgia" },
  { name: "Impact", value: "Impact" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
  { name: "Trebuchet MS", value: "Trebuchet MS" },
  { name: "Verdana", value: "Verdana" },
  { name: "Courier New", value: "Courier New" },
  { name: "Palatino", value: "Palatino" },
];

export const DesignCanvas = ({ side, selectedColor = "White" }: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [newText, setNewText] = useState("Your Text");
  
  // Text properties
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("center");

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = side === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 320,
      height: 400,
      backgroundColor: "transparent",
      selection: true,
    });

    // Add selection events
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Update text properties when text object is selected
    canvas.on('object:modified', (e) => {
      if (e.target && e.target.type === 'text') {
        const textObj = e.target as FabricText;
        setFontSize([textObj.fontSize || 24]);
        setFontFamily(textObj.fontFamily || "Arial");
        setTextColor(textObj.fill as string || "#000000");
        setIsBold(textObj.fontWeight === 'bold');
        setIsItalic(textObj.fontStyle === 'italic');
        setIsUnderline(textObj.underline || false);
        setTextAlign(textObj.textAlign || "center");
      }
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [side]);

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new FabricText(newText, {
      left: 50,
      top: 50,
      fontFamily: fontFamily,
      fontSize: fontSize[0],
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      textAlign: textAlign as any,
      editable: true,
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    setSelectedObject(text);
    toast.success("Text added to design");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgElement = new Image();
      imgElement.onload = () => {
        FabricImage.fromURL(e.target?.result as string).then((img) => {
          // Scale image to reasonable size
          const maxWidth = 150;
          const maxHeight = 150;
          const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
          
          img.set({
            left: 50,
            top: 50,
            scaleX: scale,
            scaleY: scale,
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          setSelectedObject(img);
          toast.success("Image added to design");
        });
      };
      imgElement.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateTextProperties = () => {
    if (!selectedObject || selectedObject.type !== 'text') return;

    selectedObject.set({
      fontSize: fontSize[0],
      fontFamily: fontFamily,
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      textAlign: textAlign,
    });

    fabricCanvas?.renderAll();
  };

  const deleteSelected = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    fabricCanvas.remove(selectedObject);
    fabricCanvas.renderAll();
    setSelectedObject(null);
    toast.success("Element deleted");
  };

  const duplicateSelected = () => {
    if (!fabricCanvas || !selectedObject) return;

    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: selectedObject.left + 20,
        top: selectedObject.top + 20,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      setSelectedObject(cloned);
    });
    toast.success("Element duplicated");
  };

  const rotateSelected = () => {
    if (!selectedObject) return;
    
    selectedObject.rotate(selectedObject.angle + 15);
    fabricCanvas?.renderAll();
  };

  const centerHorizontally = () => {
    if (!fabricCanvas || !selectedObject) return;
    
    selectedObject.centerH();
    fabricCanvas.renderAll();
  };

  useEffect(() => {
    updateTextProperties();
  }, [fontSize, fontFamily, textColor, isBold, isItalic, isUnderline, textAlign]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Design Tools - {side === "front" ? "Front" : "Back"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Text */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Enter text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addText()}
              />
              <Button onClick={addText} size="sm">
                <Type className="w-4 h-4" />
              </Button>
            </div>
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

          {/* Element Controls */}
          {selectedObject && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {selectedObject.type === 'text' ? 'Text' : 'Image'} Properties
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={duplicateSelected} title="Duplicate">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={rotateSelected} title="Rotate">
                    <RotateCw className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={centerHorizontally} title="Center">
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={deleteSelected}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {selectedObject.type === 'text' && (
                <div className="space-y-3">
                  {/* Text Content */}
                  <Input
                    value={selectedObject.text}
                    onChange={(e) => {
                      selectedObject.set('text', e.target.value);
                      fabricCanvas?.renderAll();
                    }}
                    placeholder="Text content"
                  />

                  {/* Font Settings */}
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={fontFamily} onValueChange={setFontFamily}>
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

                    <div className="flex items-center gap-1">
                      <span className="text-sm w-8">Size:</span>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        max={72}
                        min={8}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">{fontSize[0]}</span>
                    </div>
                  </div>

                  {/* Text Formatting */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isBold ? "default" : "outline"}
                      onClick={() => setIsBold(!isBold)}
                    >
                      <Bold className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isItalic ? "default" : "outline"}
                      onClick={() => setIsItalic(!isItalic)}
                    >
                      <Italic className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={isUnderline ? "default" : "outline"}
                      onClick={() => setIsUnderline(!isUnderline)}
                    >
                      <Underline className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Text Alignment */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={textAlign === "left" ? "default" : "outline"}
                      onClick={() => setTextAlign("left")}
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={textAlign === "center" ? "default" : "outline"}
                      onClick={() => setTextAlign("center")}
                    >
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={textAlign === "right" ? "default" : "outline"}
                      onClick={() => setTextAlign("right")}
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Text Color */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Color:</span>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-16 h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas with T-shirt Background */}
      <div className="relative mx-auto" style={{ width: "320px", height: "400px" }}>
        {/* T-shirt background */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden"
          style={{
            backgroundColor: currentColor?.value || "#ffffff",
          }}
        >
          <img
            src={tshirtImage}
            alt={`T-shirt ${side}`}
            className="w-full h-full object-contain"
            style={{
              filter: currentColor?.name !== "White" ? `brightness(0) saturate(100%) invert(${currentColor?.name === "Black" ? "0%" : "100%"})` : "none",
            }}
          />
        </div>

        {/* Design canvas overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="relative border-2 border-dashed border-primary/30"
            style={{
              width: "200px",
              height: "250px",
              marginTop: "20px",
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 rounded"
              style={{
                width: "200px",
                height: "250px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};