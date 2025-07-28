import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { openAIService } from "@/services/openai";
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
  Move,
  Wand2,
  Key,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

interface RightPanelProps {
  activeTool: string;
  selectedObject: any;
  onTextPropertiesChange: (properties: any) => void;
  onImageUpload: (file: File) => void;
  onProductColorChange: (color: string) => void;
}

const fonts = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Impact",
  "Comic Sans MS", "Trebuchet MS", "Verdana", "Courier New", "Palatino",
  "Open Sans", "Roboto", "Lato", "Montserrat", "Oswald"
];

const colors = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ffa500", "#800080", "#008000", "#ff69b4"
];

export const RightPanel = ({
  activeTool,
  selectedObject,
  onTextPropertiesChange,
  onImageUpload,
  onProductColorChange,
}: RightPanelProps) => {
  // Text states
  const [textContent, setTextContent] = useState("Sample Text");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  // Transform states
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(openAIService.getApiKey() || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  // Text elements state
  const [textElements, setTextElements] = useState<any[]>([]);

  // Sync with selectedObject and track text elements
  useEffect(() => {
    if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text")) {
      setTextContent(selectedObject.text || "");
      setFontFamily(selectedObject.fontFamily || "Arial");
      setFontSize(selectedObject.fontSize || 24);
      setTextColor(selectedObject.fill || "#000000");
      setIsBold(selectedObject.fontWeight === "bold");
      setIsItalic(selectedObject.fontStyle === "italic");
      setIsUnderline(selectedObject.underline || false);
      setTextAlign(selectedObject.textAlign || "left");
      setScalePercent(Math.round((selectedObject.scaleX || 1) * 100));
      setRotation(selectedObject.rotation || 0);
    }
  }, [selectedObject]);

  // Update text elements list when canvas changes
  useEffect(() => {
    if ((window as any).designCanvas?.canvas) {
      const canvas = (window as any).designCanvas.canvas;
      const updateTextElements = () => {
        const objects = canvas.getObjects();
        const texts = objects.filter((obj: any) => obj.type === "textbox" || obj.type === "text");
        setTextElements(texts);
      };
      
      canvas.on('object:added', updateTextElements);
      canvas.on('object:removed', updateTextElements);
      
      return () => {
        canvas.off('object:added', updateTextElements);
        canvas.off('object:removed', updateTextElements);
      };
    }
  }, []);

  const updateTextProperty = (property: string, value: any) => {
    if ((window as any).designCanvas?.updateSelectedTextProperty) {
      (window as any).designCanvas.updateSelectedTextProperty(property, value);
    }
  };

  const handleAddText = () => {
    if ((window as any).designCanvas?.addText) {
      (window as any).designCanvas.addText(textContent, {
        fontFamily,
        fontSize,
        fill: textColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        textAlign,
        scaleX: scalePercent / 100,
        scaleY: scalePercent / 100,
        rotation,
      });
    }
  };

  const handleDelete = () => (window as any).designCanvas?.deleteSelected();
  const handleDuplicate = () => (window as any).designCanvas?.duplicateSelected();
  const handleRotate = () => (window as any).designCanvas?.rotateSelected();
  const handleCenter = () => (window as any).designCanvas?.centerSelected();
  const handleDeselect = () => (window as any).designCanvas?.clearSelection();

  const handleSetApiKey = () => {
    if (!apiKey.trim()) { 
      toast.error("Please enter a valid API key"); 
      return; 
    }
    openAIService.setApiKey(apiKey.trim());
    toast.success("OpenAI API key saved!");
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!openAIService.getApiKey()) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await openAIService.generateImage({
        prompt: aiPrompt,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });
      
      // Add generated image to canvas
      if ((window as any).designCanvas?.addImageFromUrl) {
        (window as any).designCanvas.addImageFromUrl(result.url);
      }

      // Add to recent images
      setRecentImages(prev => [result.url, ...prev.slice(0, 4)]);
      toast.success("AI image generated!");
      setAiPrompt("");
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate image. Check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PNG, JPEG, or SVG files only");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    onImageUpload(file);
    toast.success("Image uploaded successfully!");
  };

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto shadow-soft">
      <Tabs defaultValue="properties" className="w-full p-4">
        {/* Only show tabs based on context */}
        {activeTool === "text" ? (
          // Text tool - only properties
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="properties">Add Text</TabsTrigger>
          </TabsList>
        ) : activeTool === "upload" ? (
          // Upload tool - only properties  
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="properties">Upload Image</TabsTrigger>
          </TabsList>
        ) : (
          // Default - all tabs
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="color">Colors</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="properties" className="mt-4 space-y-4">

          {/* Add Text Interface - Only when no text is selected */}
          {activeTool === "text" && !selectedObject && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" /> Add Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Text Content */}
                  <div>
                    <Label className="text-xs">Text</Label>
                    <Input
                      value={textContent}
                      onChange={e => setTextContent(e.target.value)}
                      placeholder="Enter text…"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Font Family */}
                  <div>
                    <Label className="text-xs">Font</Label>
                    <Select
                      value={fontFamily}
                      onValueChange={val => setFontFamily(val)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Size */}
                  <div>
                    <Label className="text-xs">Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([size]) => setFontSize(size)}
                      min={8} max={120}
                    />
                  </div>
                  
                  {/* Color */}
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={e => setTextColor(e.target.value)}
                      className="w-12 h-8 p-0 border-0"
                    />
                  </div>
                  
                  {/* Style */}
                  <div>
                    <Label className="text-xs mb-1">Style</Label>
                    <div className="flex gap-1">
                      <Button variant={isBold ? 'default' : 'outline'} size="sm" onClick={() => setIsBold(!isBold)}>
                        <Bold className="w-3 h-3"/>
                      </Button>
                      <Button variant={isItalic ? 'default' : 'outline'} size="sm" onClick={() => setIsItalic(!isItalic)}>
                        <Italic className="w-3 h-3"/>
                      </Button>
                      <Button variant={isUnderline ? 'default' : 'outline'} size="sm" onClick={() => setIsUnderline(!isUnderline)}>
                        <Underline className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Align */}
                  <div>
                    <Label className="text-xs mb-1">Align</Label>
                    <div className="flex gap-1">
                      <Button variant={textAlign==='left'?'default':'outline'} size="sm" onClick={()=>setTextAlign('left')}>
                        <AlignLeft className="w-3 h-3"/>
                      </Button>
                      <Button variant={textAlign==='center'?'default':'outline'} size="sm" onClick={()=>setTextAlign('center')}>
                        <AlignCenter className="w-3 h-3"/>
                      </Button>
                      <Button variant={textAlign==='right'?'default':'outline'} size="sm" onClick={()=>setTextAlign('right')}>
                        <AlignRight className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-2" onClick={handleAddText}>Add Text</Button>
                </CardContent>
              </Card>

              {/* Text Elements List */}
              {textElements.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Type className="w-4 h-4" /> Text Elements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {textElements.map((textObj, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border-2 cursor-pointer transition-all ${
                          selectedObject === textObj
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          if ((window as any).designCanvas?.canvas) {
                            (window as any).designCanvas.canvas.setActiveObject(textObj);
                            (window as any).designCanvas.canvas.renderAll();
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">
                              {textObj.text || "Text Element"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {textObj.fontFamily} • {Math.round(textObj.fontSize)}px
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((window as any).designCanvas?.canvas) {
                                  (window as any).designCanvas.canvas.setActiveObject(textObj);
                                  (window as any).designCanvas.duplicateSelected();
                                }
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((window as any).designCanvas?.canvas) {
                                  (window as any).designCanvas.canvas.remove(textObj);
                                  (window as any).designCanvas.canvas.renderAll();
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Edit Selected Text - Only when text is selected */}
          {activeTool === "editText" && selectedObject && (selectedObject.type === 'textbox' || selectedObject.type === 'text') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" /> Edit Selected Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Text Content */}
                <div>
                  <Label className="text-xs">Text</Label>
                  <Input
                    value={textContent}
                    onChange={e => {
                      setTextContent(e.target.value);
                      updateTextProperty('text', e.target.value);
                    }}
                    placeholder="Enter text…"
                    className="mt-1"
                  />
                </div>
                
                {/* Font Family */}
                <div>
                  <Label className="text-xs">Font</Label>
                  <Select
                    value={fontFamily}
                    onValueChange={val => {
                      setFontFamily(val);
                      updateTextProperty('fontFamily', val);
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                    {/* Font Size */}
                    <div>
                      <Label className="text-xs">Size: {fontSize}px</Label>
                      <Slider
                        value={[fontSize]}
                        onValueChange={([size]) => setFontSize(size)}
                        onValueCommit={([size]) => updateTextProperty('fontSize', size)}
                        min={8} max={120}
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={e => {
                          setTextColor(e.target.value);
                          updateTextProperty('fill', e.target.value);
                        }}
                        className="w-12 h-8 p-0 border-0"
                      />
                    </div>

                    {/* Style */}
                    <div>
                      <Label className="text-xs mb-1">Style</Label>
                      <div className="flex gap-1">
                        <Button 
                          variant={isBold ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => {
                            setIsBold(!isBold);
                            updateTextProperty('fontWeight', !isBold ? 'bold' : 'normal');
                          }}
                        >
                          <Bold className="w-3 h-3"/>
                        </Button>
                        <Button 
                          variant={isItalic ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => {
                            setIsItalic(!isItalic);
                            updateTextProperty('fontStyle', !isItalic ? 'italic' : 'normal');
                          }}
                        >
                          <Italic className="w-3 h-3"/>
                        </Button>
                        <Button 
                          variant={isUnderline ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => {
                            setIsUnderline(!isUnderline);
                            updateTextProperty('underline', !isUnderline);
                          }}
                        >
                          <Underline className="w-3 h-3"/>
                        </Button>
                      </div>
                    </div>

                    {/* Align */}
                    <div>
                      <Label className="text-xs mb-1">Align</Label>
                      <div className="flex gap-1">
                        <Button 
                          variant={textAlign==='left'?'default':'outline'} 
                          size="sm" 
                          onClick={() => {
                            setTextAlign('left');
                            updateTextProperty('textAlign', 'left');
                          }}
                        >
                          <AlignLeft className="w-3 h-3"/>
                        </Button>
                        <Button 
                          variant={textAlign==='center'?'default':'outline'} 
                          size="sm" 
                          onClick={() => {
                            setTextAlign('center');
                            updateTextProperty('textAlign', 'center');
                          }}
                        >
                          <AlignCenter className="w-3 h-3"/>
                        </Button>
                        <Button 
                          variant={textAlign==='right'?'default':'outline'} 
                          size="sm" 
                          onClick={() => {
                            setTextAlign('right');
                            updateTextProperty('textAlign', 'right');
                          }}
                        >
                          <AlignRight className="w-3 h-3"/>
                        </Button>
                      </div>
                    </div>

                    {/* Scale */}
                    <div>
                      <Label className="text-xs">Scale: {scalePercent}%</Label>
                      <Slider
                        value={[scalePercent]}
                        onValueChange={([v]) => setScalePercent(v)}
                        onValueCommit={([v]) => {
                          updateTextProperty('scaleX', v/100);
                          updateTextProperty('scaleY', v/100);
                        }}
                        min={50} max={500} step={10}
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <Label className="text-xs">Rotation: {rotation}°</Label>
                      <Slider
                        value={[rotation]}
                        onValueChange={([deg]) => setRotation(deg)}
                        onValueCommit={([deg]) => {
                          updateTextProperty('rotation', deg);
                          (window as any).designCanvas?.setRotation(deg);
                        }}
                        min={0} max={360} step={1}
                      />
                    </div>

                    {/* Actions */}
                    <div>
                      <Label className="text-xs">Actions</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button variant="outline" size="sm" onClick={handleDuplicate}>
                          <Copy className="w-3 h-3 mr-1"/>Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCenter}>
                          <Move className="w-3 h-3 mr-1"/>Center
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                          <Trash2 className="w-3 h-3 mr-1"/>Delete
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeselect}>
                          Deselect
                        </Button>
                      </div>
                     </div>
                   </CardContent>
                 </Card>
               )}

          {/* Image Upload Tool */}
          {activeTool === "upload" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPEG, SVG up to 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Properties for Selected Object */}
          {selectedObject?.type === 'image' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Image Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs">Actions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={handleDuplicate}>
                      <Copy className="w-3 h-3 mr-1"/>Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRotate}>
                      <RotateCw className="w-3 h-3 mr-1"/>Rotate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCenter}>
                      <Move className="w-3 h-3 mr-1"/>Center
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                      <Trash2 className="w-3 h-3 mr-1"/>Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeselect}>
                      Deselect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="color" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" /> T-Shirt Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-12 h-12 rounded border-2 border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => onProductColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {(selectedObject?.type === 'textbox' || selectedObject?.type === 'text') && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" /> Text Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setTextColor(color);
                        updateTextProperty("fill", color);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="w-4 h-4" /> API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter OpenAI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
              <Button onClick={handleSetApiKey} className="w-full" size="sm">
                Save API Key
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="w-4 h-4" /> AI Image Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Describe your image</Label>
                <Input
                  placeholder="e.g., retro robot on skateboard"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerateAI()}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {recentImages.length > 0 && (
                <div>
                  <Label className="text-xs">Recent Generated Images</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {recentImages.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => {
                          if ((window as any).designCanvas?.addImageFromUrl) {
                            (window as any).designCanvas.addImageFromUrl(url);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};