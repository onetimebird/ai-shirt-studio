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
import { openAIService, type GenerateImageParams } from "@/services/openai";
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
  
  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(openAIService.getApiKey() || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [lastGeneratedImages, setLastGeneratedImages] = useState<string[]>([]);

  // Update selected object properties when changed
  useEffect(() => {
    if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text")) {
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
    if ((window as any).designCanvas?.updateSelectedTextProperty) {
      (window as any).designCanvas.updateSelectedTextProperty(property, value);
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

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    openAIService.setApiKey(apiKey.trim());
    toast.success("OpenAI API key saved!");
  };

  const handleGenerateAI = async () => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI image");
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

      // Add the generated image to canvas
      if ((window as any).designCanvas) {
        // Create a temporary file-like object to use existing upload logic
        const response = await fetch(result.url);
        const blob = await response.blob();
        const file = new File([blob], "ai-generated.png", { type: "image/png" });
        onImageUpload(file);
        
        // Track generated images
        setLastGeneratedImages(prev => [result.url, ...prev.slice(0, 4)]);
        toast.success("AI image added to design!");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGeneratedImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated.png", { type: "image/png" });
      onImageUpload(file);
      toast.success("Image added to design!");
    } catch (error) {
      toast.error("Failed to add image to design");
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto shadow-soft">
      <div className="p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="color">Colors</TabsTrigger>
            <TabsTrigger value="ai">AI Generator</TabsTrigger>
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
            {(selectedObject?.type === "textbox" || selectedObject?.type === "text") && (
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

            {/* AI Image Generator */}
            {activeTool === "ai" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI Image Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* API Key Setup */}
                  {!openAIService.getApiKey() && (
                    <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">API Key Required</span>
                      </div>
                      <p className="text-xs text-yellow-700 mb-3">
                        To generate AI images, you need an OpenAI API key. Get yours at{" "}
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                          platform.openai.com
                        </a>
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="text-xs pr-8"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                        <Button onClick={handleSetApiKey} size="sm">
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Prompt Input */}
                  <div>
                    <Label className="text-xs">Describe what you want to create</Label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., a retro robot on a skateboard, vibrant colors, cartoon style"
                      className="w-full mt-1 p-2 border border-border rounded text-sm resize-none"
                      rows={3}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerateAI} 
                    disabled={!apiKey || !aiPrompt.trim() || isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate AI Image
                      </>
                    )}
                  </Button>

                  {/* Recent Generations */}
                  {lastGeneratedImages.length > 0 && (
                    <div>
                      <Label className="text-xs">Recent Generations</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {lastGeneratedImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => handleUseGeneratedImage(imageUrl)}
                            className="relative aspect-square rounded border border-border hover:border-primary transition-colors overflow-hidden group"
                          >
                            <img
                              src={imageUrl}
                              alt={`Generated ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs">Use Image</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Powered by DALL-E 3. Images are generated in 1024x1024 resolution.
                  </p>
                </CardContent>
              </Card>
            )}

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
                        
                        // Check image resolution
                        const img = new Image();
                        img.onload = () => {
                          const dpi = 150; // Target DPI
                          const maxPrintSize = 10; // 10 inches
                          const minPixels = dpi * maxPrintSize;
                          
                          if (img.width < minPixels || img.height < minPixels) {
                            toast.error(`Warning: Low resolution image. For best print quality, use images at least ${minPixels}x${minPixels} pixels.`, {
                              duration: 5000
                            });
                          }
                        };
                        img.src = URL.createObjectURL(file);
                        
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
                    Supports PNG, JPEG, SVG, PDF (max 20MB)<br/>
                    For best print quality: 1500x1500px minimum
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
                        if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text")) {
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

          <TabsContent value="ai" className="space-y-4 mt-4">
            {/* AI Generator content is shown above when activeTool === "ai" */}
            {activeTool !== "ai" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI Image Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Select "AI Image Generator" from the left toolbar to create custom artwork with AI.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};