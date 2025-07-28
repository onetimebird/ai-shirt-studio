import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Type, 
  Palette, 
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Copy,
  Trash2,
  Move
} from "lucide-react";

interface RightPanelProps {
  activeTool: string;
  selectedObject: any;
  onTextPropertiesChange: (properties: any) => void;
  onImageUpload: (file: File) => void;
}

const fonts = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Impact", 
  "Comic Sans MS", "Trebuchet MS", "Verdana", "Courier New", "Palatino",
  "Open Sans", "Roboto", "Lato", "Montserrat", "Oswald"
];

export const RightPanel = ({ 
  activeTool, 
  selectedObject,
  onTextPropertiesChange,
  onImageUpload 
}: RightPanelProps) => {
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [textContent, setTextContent] = useState("Sample Text");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  // Update selected object properties when changed
  useEffect(() => {
    if (selectedObject && selectedObject.type === "textbox") {
      setTextContent(selectedObject.text || "");
      setFontSize([selectedObject.fontSize || 24]);
      setFontFamily(selectedObject.fontFamily || "Arial");
      setTextColor(selectedObject.fill || "#000000");
      setIsBold(selectedObject.fontWeight === "bold");
      setIsItalic(selectedObject.fontStyle === "italic");
      setIsUnderline(selectedObject.underline || false);
      setTextAlign(selectedObject.textAlign || "left");
    }
  }, [selectedObject]);

  const updateTextProperty = (property: string, value: any) => {
    if (selectedObject && (window as any).designCanvas) {
      selectedObject.set(property, value);
      (window as any).designCanvas.canvas?.renderAll();
    }
  };

  const handleAddText = () => {
    if ((window as any).designCanvas) {
      (window as any).designCanvas.addText(textContent);
    }
  };

  const handleDeleteSelected = () => {
    if ((window as any).designCanvas) {
      (window as any).designCanvas.deleteSelected();
    }
  };

  const handleDuplicateSelected = () => {
    if ((window as any).designCanvas) {
      (window as any).designCanvas.duplicateSelected();
    }
  };

  const handleRotateSelected = () => {
    if ((window as any).designCanvas) {
      (window as any).designCanvas.rotateSelected();
    }
  };

  const handleCenterSelected = () => {
    if ((window as any).designCanvas) {
      (window as any).designCanvas.centerSelected();
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto shadow-soft">
      <div className="p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="color">Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {/* Add Text */}
            {activeTool === "text" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Add Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Text Content</Label>
                    <Input
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter your text..."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleAddText} className="w-full">
                    Add Text to Design
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Text Properties - Only show when text is selected */}
            {selectedObject?.type === "textbox" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Content */}
                  <div>
                    <Label className="text-xs">Text Content</Label>
                    <Input
                      value={textContent}
                      onChange={(e) => {
                        setTextContent(e.target.value);
                        updateTextProperty("text", e.target.value);
                      }}
                      className="mt-1"
                    />
                  </div>

                  {/* Font Family */}
                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Select 
                      value={fontFamily} 
                      onValueChange={(value) => {
                        setFontFamily(value);
                        updateTextProperty("fontFamily", value);
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <Label className="text-xs">Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={(value) => {
                        setFontSize(value);
                        updateTextProperty("fontSize", value[0]);
                      }}
                      max={120}
                      min={8}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          updateTextProperty("fill", e.target.value);
                        }}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          updateTextProperty("fill", e.target.value);
                        }}
                        className="flex-1 h-8"
                      />
                    </div>
                  </div>

                  {/* Text Formatting */}
                  <div>
                    <Label className="text-xs">Formatting</Label>
                    <div className="flex gap-1 mt-2">
                      <Button 
                        variant={isBold ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const newBold = !isBold;
                          setIsBold(newBold);
                          updateTextProperty("fontWeight", newBold ? "bold" : "normal");
                        }}
                      >
                        <Bold className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant={isItalic ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const newItalic = !isItalic;
                          setIsItalic(newItalic);
                          updateTextProperty("fontStyle", newItalic ? "italic" : "normal");
                        }}
                      >
                        <Italic className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant={isUnderline ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          const newUnderline = !isUnderline;
                          setIsUnderline(newUnderline);
                          updateTextProperty("underline", newUnderline);
                        }}
                      >
                        <Underline className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <Label className="text-xs">Alignment</Label>
                    <div className="flex gap-1 mt-2">
                      <Button 
                        variant={textAlign === "left" ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setTextAlign("left");
                          updateTextProperty("textAlign", "left");
                        }}
                      >
                        <AlignLeft className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant={textAlign === "center" ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setTextAlign("center");
                          updateTextProperty("textAlign", "center");
                        }}
                      >
                        <AlignCenter className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant={textAlign === "right" ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setTextAlign("right");
                          updateTextProperty("textAlign", "right");
                        }}
                      >
                        <AlignRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Element Actions */}
                  <div className="pt-2 border-t border-border">
                    <Label className="text-xs">Actions</Label>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleDuplicateSelected}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRotateSelected}>
                        <RotateCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCenterSelected}>
                        <Move className="w-3 h-3 mr-1" />
                        Center
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Properties - Only show when image is selected */}
            {selectedObject?.type === "image" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Element Actions */}
                  <div>
                    <Label className="text-xs">Actions</Label>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleDuplicateSelected}>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRotateSelected}>
                        <RotateCw className="w-3 h-3 mr-1" />
                        Rotate
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCenterSelected}>
                        <Move className="w-3 h-3 mr-1" />
                        Center
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Color Swatches */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 32 }, (_, i) => (
                    <button
                      key={i}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: `hsl(${i * 11.25}, ${i % 2 === 0 ? 70 : 50}%, ${50 + (i % 3) * 20}%)`
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            {activeTool === "upload" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (max 20MB)
                        if (file.size > 20 * 1024 * 1024) {
                          toast.error("File size must be less than 20MB");
                          return;
                        }
                        onImageUpload(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button asChild className="w-full h-20 border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center gap-2 cursor-pointer">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm">Click to Upload</span>
                        <span className="text-xs text-muted-foreground">or drag & drop</span>
                      </div>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground text-center">
                    Supports PNG, JPEG, SVG, PDF (max 20MB)
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="color" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Quick Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
                    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000", "#FFC0CB",
                    "#A52A2A", "#808080", "#000080", "#800000", "#008080", "#808000"].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        if (selectedObject && selectedObject.type === "textbox") {
                          setTextColor(color);
                          updateTextProperty("fill", color);
                        }
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};