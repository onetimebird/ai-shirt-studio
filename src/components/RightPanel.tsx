import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { openAIService } from "@/services/openai";
import { Text as FabricText, Textbox as FabricTextbox, Image as FabricImage } from "fabric";
import { AIArtPanel } from "@/components/AIArtPanel";
import { ProductSelector } from "@/components/ProductSelector";
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
  textObjects: any[];
  selectedProduct?: string;
  selectedColor?: string;
  onProductChange?: (productId: string) => void;
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
  textObjects = [],
  selectedProduct = "bella-3001c",
  selectedColor = "White",
  onProductChange
}: RightPanelProps) => {
  console.log("🔴🔴🔴 RIGHTPANEL START - activeTool:", activeTool);
  console.log("🔴🔴🔴 FabricTextbox exists:", !!FabricTextbox);
  
  // IMMEDIATE TEST - Add text right now without setTimeout
  console.log("🟠 IMMEDIATE TEST: Checking canvas access...");
  const canvas = (window as any).designCanvas?.canvas;
  if (canvas) {
    console.log("🟠 IMMEDIATE TEST: Canvas found! Adding text immediately...");
    try {
      const textbox = new FabricTextbox("IMMEDIATE TEXT ADDED", {
        left: 100,
        top: 100,
        fill: 'purple',
        fontSize: 20
      });
      canvas.add(textbox);
      canvas.renderAll();
      console.log("🟠 IMMEDIATE TEST: SUCCESS! Text added.");
    } catch (error) {
      console.error("🔴 IMMEDIATE TEST: Error adding text:", error);
    }
  } else {
    console.log("🔴 IMMEDIATE TEST: Canvas not found!");
  }
  
  // Text states
  const [textContent, setTextContent] = useState("New multi-line text\nType here...");
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

  // Debug: confirm global canvas object on mount
  useEffect(() => {
    console.log("[RightPanel] mounted, window.designCanvas=", (window as any).designCanvas);
  }, []);

  // Sync with selectedObject 
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

  const updateTextProperty = (property: string, value: any) => {
    if ((window as any).designCanvas?.updateSelectedTextProperty) {
      (window as any).designCanvas.updateSelectedTextProperty(property, value);
    }
  };

  // --- CLEAN "Add Text" handler ---
  // --- Direct Fabric Add‐Text handler (improved) ---
  const handleAddText = () => {
    console.log("[RightPanel] handleAddText() - DIRECT FABRIC APPROACH");
    console.log("[RightPanel] window.designCanvas=", (window as any).designCanvas);
    
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) {
      console.log("[RightPanel] ❌ Canvas not ready");
      toast.error("Canvas not ready");
      return;
    }
    
    console.log("[RightPanel] ✅ Canvas found, creating textbox with:", { 
      text: textContent, 
      fontFamily, 
      fontSize, 
      fill: textColor, 
      textAlign
    });
    
    // Use direct Fabric import instead of FabricTextbox
    const textbox = new FabricTextbox(textContent, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      fontFamily,
      fontSize,
      fill: textColor,
      textAlign: textAlign as any,
      // Force text to be above everything
      selectable: true,
      evented: true
    });
    
    canvas.add(textbox);
    
    // CRITICAL: Force text to top after any possible image reloads
    setTimeout(() => {
      canvas.bringObjectToFront(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();
      console.log("[RightPanel] ✅ Text forced to front after delay");
    }, 100);
    
    console.log("[RightPanel] ✅ Text added successfully, objects count:", canvas.getObjects().length);
    setTextContent("New multi-line text\nType here...");
    toast.success("Text added to canvas");
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

  // --- Direct Fabric File‐upload handler (improved) ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[RightPanel] handleFileUpload() - DIRECT FABRIC APPROACH");
    console.log("[RightPanel] window.designCanvas=", (window as any).designCanvas);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowed = ["image/png","image/jpeg","image/jpg","image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PNG/JPG/SVG under 10 MB");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be < 10 MB");
      return;
    }
    
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) {
      console.log("[RightPanel] ❌ Canvas not ready");
      toast.error("Canvas not ready");
      return;
    }
    
    console.log("[RightPanel] ✅ Canvas found, reading file with FileReader");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      console.log("[RightPanel] ✅ File read, creating Fabric image from URL");
      
      // Use FabricImage.fromURL with correct v6 syntax
      FabricImage.fromURL(src).then((img) => {
        console.log("[RightPanel] ✅ Fabric image created, adding to canvas");
        
        // Center and scale the image
        img.set({
          left: canvas.getWidth() / 2,
          top: canvas.getHeight() / 2,
          originX: 'center',
          originY: 'center',
        });
        img.scaleToWidth(canvas.getWidth() * 0.5);
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        
        console.log("[RightPanel] ✅ Image added successfully, objects count:", canvas.getObjects().length);
        toast.success("Image added to canvas");
      }).catch((error) => {
        console.error("[RightPanel] ❌ Error creating image:", error);
        toast.error("Failed to load image");
      });
    };
    reader.readAsDataURL(file);
  };

  // use a ref to reliably trigger the hidden input on both mobile & desktop
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = () => {
    console.log("[RightPanel] 👉 handleUploadClick triggered");
    fileInputRef.current?.click();
  };

  // Determine which tab should be active based on the current tool
  const getActiveTab = () => {
    switch (activeTool) {
      case "text":
      case "editText":
      case "upload":
        return "properties";
      case "ai":
        return "ai";
      case "products":
        return "products";
      default:
        return "properties";
    }
  };

  return (
    <div className="w-full lg:w-80 bg-card border-l border-border overflow-y-auto shadow-soft">
      {/* VISUAL DEBUG - This should be impossible to miss */}
      <div className="bg-red-500 text-white p-4 text-center font-bold text-lg">
        🔴 NEW RIGHTPANEL LOADED - Tool: {activeTool} - Time: {new Date().getTime()}
      </div>
      
      {/* WORKING BUTTON - Canvas should be ready by now */}
      <div className="p-4 bg-green-300">
        <div 
          className="bg-blue-600 text-white p-3 text-center cursor-pointer font-bold"
          onMouseDown={() => {
            console.log("🔵 WORKING BUTTON CLICKED!");
            const canvas = (window as any).designCanvas?.canvas;
            console.log("🔵 Canvas available:", !!canvas);
            
            if (canvas) {
              console.log("🔵 Adding text with working button...");
              const textbox = new FabricTextbox("VISIBLE TEXT!", {
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center',
                fill: '#FF0000',  // Bright red
                fontSize: 40,     // Large size
                fontWeight: 'bold',
                backgroundColor: '#FFFF00', // Yellow background
                stroke: '#000000', // Black outline
                strokeWidth: 2
              });
              canvas.add(textbox);
              canvas.bringObjectToFront(textbox);  // Correct API!
              canvas.setActiveObject(textbox);
              canvas.renderAll();
              console.log("🔵 SUCCESS! Text added by working button.");
            } else {
              console.log("🔴 Canvas still not available!");
            }
          }}
        >
          🔵 WORKING ADD TEXT BUTTON
        </div>
      </div>
      <Tabs value={getActiveTab()} className="w-full p-4">
        {/* Only show tabs based on context */}
        {activeTool === "text" || activeTool === "editText" ? (
          // Text tool - only properties for add/edit
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="properties">
              {activeTool === "text" ? "Add Text" : "Edit Text"}
            </TabsTrigger>
          </TabsList>
        ) : activeTool === "upload" ? (
          // Upload tool - only properties  
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="properties">Upload Image</TabsTrigger>
          </TabsList>
        ) : activeTool === "ai" ? (
          // AI tool - only AI tab
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="ai">AI Image Generator</TabsTrigger>
          </TabsList>
        ) : activeTool === "products" ? (
          // Products tool - only products tab
          <TabsList className="grid grid-cols-1 gap-2">
            <TabsTrigger value="products">Change Product</TabsTrigger>
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

          {/* Add Text Interface - Only when in text mode and no object selected */}
          {activeTool === "text" && (
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
                    <Textarea
                      value={textContent}
                      onChange={e => setTextContent(e.target.value)}
                      placeholder="Enter multi-line text..."
                      rows={4}
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
                      <Button 
                        variant={isBold ? 'premium' : 'outline'} 
                        size="sm" 
                        onClick={() => setIsBold(!isBold)}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <Bold className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={isItalic ? 'premium' : 'outline'} 
                        size="sm" 
                        onClick={() => setIsItalic(!isItalic)}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <Italic className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={isUnderline ? 'premium' : 'outline'} 
                        size="sm" 
                        onClick={() => setIsUnderline(!isUnderline)}
                        className="hover:shadow-md transition-all duration-200"
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
                        variant={textAlign==='left'?'premium':'outline'} 
                        size="sm" 
                        onClick={()=>setTextAlign('left')}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <AlignLeft className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={textAlign==='center'?'premium':'outline'} 
                        size="sm" 
                        onClick={()=>setTextAlign('center')}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <AlignCenter className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={textAlign==='right'?'premium':'outline'} 
                        size="sm" 
                        onClick={()=>setTextAlign('right')}
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <AlignRight className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Triple-event button for maximum compatibility */}
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    onClick={() => {
                      console.log("[RightPanel] 👉 Add Text onClick");
                      handleAddText();
                    }}
                    onPointerUp={() => {
                      console.log("[RightPanel] 👉 Add Text onPointerUp");
                      handleAddText();
                    }}
                    onTouchEnd={() => {
                      console.log("[RightPanel] 👉 Add Text onTouchEnd");
                      handleAddText();
                    }}
                  >
                    ✨ Add Text
                  </Button>
                </CardContent>
              </Card>

              {/* Text Elements List */}
              {textObjects.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Type className="w-4 h-4" /> Text Elements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {textObjects.map((textObj, index) => (
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
                              {textObj.text?.split('\n')[0] || "Text Element"}
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
                  <Textarea
                    value={textContent}
                    onChange={e => {
                      setTextContent(e.target.value);
                      updateTextProperty('text', e.target.value);
                    }}
                    placeholder="Enter multi-line text..."
                    rows={4}
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
              <CardContent className="space-y-4">
                {/* Local File Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop or click to upload
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    hidden
                  />
                  <button
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0 rounded-md h-10 px-4 cursor-pointer relative z-[9999]"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("[RightPanel] 👉 Upload BUTTON clicked");
                      handleUploadClick();
                    }}
                    style={{ 
                      position: 'relative',
                      zIndex: 9999,
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    📁 Choose File
                  </button>
                  <p className="text-xs text-muted-foreground mt-2">
                    PNG, JPEG, SVG up to 10MB
                  </p>
                </div>

                {/* Google Drive Upload */}
                <div className="border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.26 10.5l2.25-3.9L16.66 6l-2.25 3.9L6.26 10.5z"/>
                      <path d="M19.19 11.5l-2.26-3.91L9.74 7.59l2.26 3.91l7.19-.01z"/>
                      <path d="M11.26 17.5H4.74L1.5 12l3.24 5.5h6.52z"/>
                      <path d="M15.26 17.5H8.74l3.26-5.65L15.26 17.5z"/>
                    </svg>
                    <span className="text-sm font-medium">Google Drive</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0"
                    onClick={() => {
                      // Initialize Google Drive picker
                      if (typeof window !== 'undefined' && (window as any).google?.picker) {
                        const picker = new (window as any).google.picker.PickerBuilder()
                          .addView((window as any).google.picker.ViewId.DOCS_IMAGES)
                          .setOAuthToken('ya29.demo') // This would need real OAuth token
                          .setCallback((data: any) => {
                            if (data.action === (window as any).google.picker.Action.PICKED) {
                              const file = data.docs[0];
                              const imageUrl = `https://drive.google.com/uc?id=${file.id}`;
                              if ((window as any).designCanvas?.addImageFromUrl) {
                                (window as any).designCanvas.addImageFromUrl(imageUrl);
                                toast.success("Image uploaded from Google Drive!");
                              }
                            }
                          })
                          .build();
                        picker.setVisible(true);
                      } else {
                        // Fallback: show a simple URL input for Google Drive links
                        const url = prompt("Paste a Google Drive image share link:");
                        if (url) {
                          // Extract file ID from various Google Drive URL formats
                          let fileId = '';
                          const patterns = [
                            /\/file\/d\/([a-zA-Z0-9-_]+)/,
                            /id=([a-zA-Z0-9-_]+)/,
                            /\/d\/([a-zA-Z0-9-_]+)/
                          ];
                          
                          for (const pattern of patterns) {
                            const match = url.match(pattern);
                            if (match) {
                              fileId = match[1];
                              break;
                            }
                          }
                          
                          if (fileId) {
                            const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
                            if ((window as any).designCanvas?.addImageFromUrl) {
                              (window as any).designCanvas.addImageFromUrl(directUrl);
                              toast.success("Image uploaded from Google Drive!");
                            }
                          } else {
                            toast.error("Invalid Google Drive link. Please use a shareable link.");
                          }
                        }
                      }
                    }}
                  >
                    📂 Upload from Drive
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload images from your Google Drive
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
          <AIArtPanel onImageGenerated={(url) => {
            if ((window as any).designCanvas?.addImageFromUrl) {
              (window as any).designCanvas.addImageFromUrl(url);
            }
          }} />
        </TabsContent>

        <TabsContent value="products" className="space-y-4 mt-4">
          <ProductSelector 
            selectedProduct={selectedProduct}
            selectedColor={selectedColor}
            onProductChange={(productId) => {
              onProductChange?.(productId);
            }}
            onColorChange={(color) => {
              onProductColorChange(color);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};