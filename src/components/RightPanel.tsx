import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/lib/backgroundRemoval";
import { openAIService } from "@/services/openai";
import { Text as FabricText, Textbox as FabricTextbox } from "fabric";
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
  imageObjects?: any[];
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
  imageObjects = [],
  selectedProduct = "bella-3001c",
  selectedColor = "White",
  onProductChange
}: RightPanelProps) => {
  // Text states
  const [textContent, setTextContent] = useState("New multi-line text\nType here...");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("left");

  // New text features
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textRotation, setTextRotation] = useState(0);

  // Transform states
  const [scalePercent, setScalePercent] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(openAIService.getApiKey() || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageObject, setUploadedImageObject] = useState<any>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

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
      setTextRotation(selectedObject.angle || 0);
      setStrokeColor(selectedObject.stroke || "#000000");
      setStrokeWidth(selectedObject.strokeWidth || 0);
      setLetterSpacing(selectedObject.charSpacing || 0);
    }
  }, [selectedObject]);

  const updateTextProperty = (property: string, value: any) => {
    if ((window as any).designCanvas?.updateSelectedTextProperty) {
      (window as any).designCanvas.updateSelectedTextProperty(property, value);
    }
  };

  const handleAddText = () => {
    console.log("[Debug] handleAddText called, window.designCanvas:", (window as any).designCanvas);
    const fabricCanvas = (window as any).designCanvas?.canvas;
    console.log("[Debug] Canvas available:", !!fabricCanvas);
    
    if (!fabricCanvas) {
      console.log("[Debug] Canvas not ready, showing error");
      toast.error("Canvas not ready");
      return;
    }

    console.log("[Debug] Creating text:", textContent);
    console.log("[Debug] Canvas details:", {
      width: fabricCanvas.width,
      height: fabricCanvas.height,
      objectCount: fabricCanvas.getObjects().length
    });

    // Use FabricText instead of FabricTextbox for auto-sizing text
    const textObject = new FabricText(textContent, {
      left: fabricCanvas.width! / 2,
      top: fabricCanvas.height! / 2,
      fontFamily,
      fontSize,
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      textAlign: textAlign as any,
      originX: 'center',
      originY: 'center',
      editable: true,
      objectCaching: false,
    });

    // For multi-line text, convert to textbox but with better sizing
    if (textContent.includes('\n')) {
      const textbox = new FabricTextbox(textContent, {
        left: fabricCanvas.width! / 2,
        top: fabricCanvas.height! / 2,
        fontFamily,
        fontSize,
        fill: textColor,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        textAlign: textAlign as any,
        originX: 'center',
        originY: 'center',
        editable: true,
        objectCaching: false,
        // Set width to auto-adjust based on content
        width: Math.min(400, Math.max(100, textContent.split('\n')[0].length * fontSize * 0.7))
      });
      
      console.log("[Debug] Adding multi-line textbox to canvas");
      fabricCanvas.add(textbox);
      fabricCanvas.bringObjectToFront(textbox);
      fabricCanvas.setActiveObject(textbox);
    } else {
      console.log("[Debug] Adding single-line text to canvas");
      fabricCanvas.add(textObject);
      fabricCanvas.bringObjectToFront(textObject);
      fabricCanvas.setActiveObject(textObject);
    }
    fabricCanvas.renderAll();
    console.log("[Debug] Canvas objects after addText:", fabricCanvas.getObjects().map((obj: any) => ({
      type: obj.type,
      left: obj.left,
      top: obj.top,
      visible: obj.visible,
      opacity: obj.opacity
    })));
    
    // Keep text content as is for adding multiple texts
    // setTextContent("New multi-line text\nType here...");
    
    // Clear the canvas selection after a short delay to allow the new object to be selected first
    setTimeout(() => {
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }, 200);
    
    // Update text objects list
    if ((window as any).designCanvas?.updateTextObjects) {
      (window as any).designCanvas.updateTextObjects();
    }
    
    console.log("[Debug] Text added successfully");
    toast.success("Text added to design");
  };

  const handleDelete = () => {
    const fabricCanvas = (window as any).designCanvas?.canvas;
    const activeObject = fabricCanvas?.getActiveObject();
    
    if (!activeObject) {
      toast.error("No object selected to delete");
      return;
    }
    
    fabricCanvas.remove(activeObject);
    fabricCanvas.renderAll();
    
    // Update objects list
    if ((window as any).designCanvas?.updateTextObjects) {
      (window as any).designCanvas.updateTextObjects();
    }
    if ((window as any).designCanvas?.updateImageObjects) {
      (window as any).designCanvas.updateImageObjects();
    }
    
    toast.success("Object deleted");
  };
  
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[Debug] handleFileUpload triggered, event:", event);
    const file = event.target.files?.[0];
    console.log("[Debug] Valid file picked:", file?.name);
    if (!file) {
      console.log("[Debug] No file selected");
      return;
    }

    console.log("[Debug] File selected:", file.name, file.type, file.size);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type);
      toast.error("Please upload PNG, JPEG, or SVG files only");
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size);
      toast.error("File size must be less than 10MB");
      return;
    }

    console.log("[Debug] Forwarding file to onImageUpload");
    onImageUpload(file);
    
    // Store the uploaded file for potential background removal
    setUploadedFile(file);
    
    // give it a moment to land on the canvas
    setTimeout(() => {
      console.log("[Debug] Canvas objects after upload:", (window as any).designCanvas?.canvas.getObjects());
    }, 500);
    toast.success("Image uploaded successfully!");
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
      <div className="w-full p-4">
        {/* Section Headers - Interactive design with hover effects */}
        {activeTool === "text" || activeTool === "editText" ? (
          // Text tool header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              {activeTool === "text" ? "Add Text" : "Edit Text"}
            </h2>
          </div>
        ) : activeTool === "upload" ? (
          // Upload tool header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              Upload Image
            </h2>
          </div>
        ) : activeTool === "ai" ? (
          // AI tool header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              AI Image Generator
            </h2>
          </div>
        ) : activeTool === "products" ? (
          // Products tool header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              Change Product
            </h2>
          </div>
        ) : (
          // Default - show simple header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              Properties
            </h2>
          </div>
        )}

        <Tabs value={getActiveTab()} className="w-full">
          <TabsContent value="properties" className="space-y-4">

          {/* Add Text Interface - Always show in text mode */}
          {activeTool === "text" && (
            <>
              {/* Existing Text Objects List - Mobile friendly */}
              {textObjects.length > 0 && (
                <Card className="mb-4">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm">Your Text Elements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    {textObjects.map((textObj, index) => (
                      <div
                        key={index}
                        className={`p-2 border rounded-md cursor-pointer transition-colors ${
                          selectedObject === textObj ? 'bg-primary/10 border-primary' : 'bg-muted/50 border-border hover:bg-muted'
                        }`}
                        onClick={() => {
                          // Select this text object on canvas
                          if ((window as any).designCanvas?.canvas) {
                            const canvas = (window as any).designCanvas.canvas;
                            canvas.setActiveObject(textObj);
                            canvas.renderAll();
                          }
                        }}
                      >
                        <div className="text-xs font-medium truncate">
                          {textObj.text || "Empty text"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {textObj.fontFamily} • {Math.round(textObj.fontSize || 24)}px
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="space-y-3 p-4">
                  {/* Text Content */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {selectedObject ? "Edit Text Content" : "New Text Content"}
                    </Label>
                    <Textarea
                      value={selectedObject ? (selectedObject.text || "") : textContent}
                      onChange={e => {
                        if (selectedObject) {
                          // Update existing text
                          updateTextProperty('text', e.target.value);
                        } else {
                          // Update new text content
                          setTextContent(e.target.value);
                        }
                      }}
                      placeholder="Enter your text here..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                  
                  {/* Add New Text Button */}
                  {!selectedObject && (
                    <Button
                      onClick={handleAddText}
                      className="w-full"
                      size="sm"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Add Text to Design
                    </Button>
                  )}

                  {/* Deselect and Add New Text - When text is selected */}
                  {selectedObject && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Clear selection
                          const fabricCanvas = (window as any).designCanvas?.canvas;
                          if (fabricCanvas) {
                            fabricCanvas.discardActiveObject();
                            fabricCanvas.renderAll();
                          }
                        }}
                        className="w-full"
                        size="sm"
                      >
                        Deselect
                      </Button>
                      <Button
                        onClick={handleAddText}
                        className="w-full"
                        size="sm"
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons Row - Only show when text is selected */}
                  {selectedObject && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if ((window as any).designCanvas?.centerSelected) {
                              (window as any).designCanvas.centerSelected();
                            }
                          }}
                          className="h-8 text-xs"
                        >
                          Center
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if ((window as any).designCanvas?.duplicateSelected) {
                              (window as any).designCanvas.duplicateSelected();
                            }
                          }}
                          className="h-8 text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if ((window as any).designCanvas?.rotateSelected) {
                              (window as any).designCanvas.rotateSelected();
                            }
                          }}
                          className="h-8 text-xs"
                        >
                          Rotate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          className="h-8 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Font Row */}
                  <div className="space-y-2 py-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Font Family</Label>
                      <Select
                        value={selectedObject ? (selectedObject.fontFamily || "Arial") : fontFamily}
                        onValueChange={val => {
                          setFontFamily(val);
                          if (selectedObject) {
                            updateTextProperty('fontFamily', val);
                          }
                        }}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map(f => (
                            <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Font Size Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Font Size</Label>
                        <span className="text-xs text-muted-foreground">
                          {selectedObject ? Math.round(selectedObject.fontSize || 24) : fontSize}px
                        </span>
                      </div>
                      <Slider
                        value={[selectedObject ? (selectedObject.fontSize || 24) : fontSize]}
                        onValueChange={([value]) => {
                          setFontSize(value);
                          if (selectedObject) {
                            updateTextProperty('fontSize', value);
                          }
                        }}
                        min={8}
                        max={120}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Color Row */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={selectedObject ? (selectedObject.fill || "#000000") : textColor}
                        onChange={e => {
                          setTextColor(e.target.value);
                          if (selectedObject) {
                            updateTextProperty('fill', e.target.value);
                          }
                        }}
                        className="w-10 h-8 p-0 border rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Outline Row */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Outline</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {strokeWidth > 0 ? `${strokeWidth}px` : 'None'}
                      </span>
                      {strokeWidth > 0 && (
                        <Input
                          type="color"
                          value={strokeColor}
                          onChange={e => {
                            setStrokeColor(e.target.value);
                            updateTextProperty('stroke', e.target.value);
                          }}
                          className="w-8 h-7 p-0 border-0 rounded cursor-pointer"
                        />
                      )}
                    </div>
                  </div>

                  {/* Style Buttons Row */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Style</Label>
                    <div className="flex gap-1">
                      <Button 
                        variant={isBold ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          const newBold = !isBold;
                          setIsBold(newBold);
                          updateTextProperty('fontWeight', newBold ? 'bold' : 'normal');
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Bold className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={isItalic ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          const newItalic = !isItalic;
                          setIsItalic(newItalic);
                          updateTextProperty('fontStyle', newItalic ? 'italic' : 'normal');
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Italic className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={isUnderline ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          const newUnderline = !isUnderline;
                          setIsUnderline(newUnderline);
                          updateTextProperty('underline', newUnderline);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Underline className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>

                  {/* Alignment Row */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Text Align</Label>
                    <div className="flex gap-1">
                      <Button 
                        variant={(selectedObject ? (selectedObject.textAlign || 'left') : textAlign)==='left'?'default':'outline'} 
                        size="sm" 
                        onClick={() => {
                          setTextAlign('left');
                          if (selectedObject) {
                            updateTextProperty('textAlign', 'left');
                          }
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <AlignLeft className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={(selectedObject ? (selectedObject.textAlign || 'left') : textAlign)==='center'?'default':'outline'} 
                        size="sm" 
                        onClick={() => {
                          setTextAlign('center');
                          if (selectedObject) {
                            updateTextProperty('textAlign', 'center');
                          }
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <AlignCenter className="w-3 h-3"/>
                      </Button>
                      <Button 
                        variant={(selectedObject ? (selectedObject.textAlign || 'left') : textAlign)==='right'?'default':'outline'} 
                        size="sm" 
                        onClick={() => {
                          setTextAlign('right');
                          if (selectedObject) {
                            updateTextProperty('textAlign', 'right');
                          }
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <AlignRight className="w-3 h-3"/>
                      </Button>
                    </div>
                  </div>

                  {/* Size Slider */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Size</Label>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Slider
                        value={[fontSize]}
                        onValueChange={([size]) => {
                          setFontSize(size);
                          updateTextProperty('fontSize', size);
                        }}
                        min={8}
                        max={120}
                        className="flex-1"
                      />
                      <div className="w-12 h-7 border rounded text-xs flex items-center justify-center bg-muted">
                        {fontSize}
                      </div>
                    </div>
                  </div>

                  {/* Outline Width Slider */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Outline</Label>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Slider
                        value={[strokeWidth]}
                        onValueChange={([width]) => {
                          setStrokeWidth(width);
                          updateTextProperty('strokeWidth', width);
                          if (width > 0) {
                            updateTextProperty('stroke', strokeColor);
                          } else {
                            updateTextProperty('stroke', null);
                          }
                        }}
                        min={0}
                        max={10}
                        className="flex-1"
                      />
                      <div className="w-12 h-7 border rounded text-xs flex items-center justify-center bg-muted">
                        {strokeWidth}
                      </div>
                    </div>
                  </div>

                  {/* Rotation Slider */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Rotate</Label>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Slider
                        value={[textRotation]}
                        onValueChange={([angle]) => {
                          setTextRotation(angle);
                          updateTextProperty('angle', angle);
                        }}
                        min={0}
                        max={360}
                        className="flex-1"
                      />
                      <div className="w-12 h-7 border rounded text-xs flex items-center justify-center bg-muted">
                        {textRotation}
                      </div>
                    </div>
                  </div>

                  {/* Letter Spacing Slider */}
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium">Spacing</Label>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <Slider
                        value={[letterSpacing]}
                        onValueChange={([spacing]) => {
                          setLetterSpacing(spacing);
                          updateTextProperty('charSpacing', spacing);
                        }}
                        min={-50}
                        max={100}
                        className="flex-1"
                      />
                      <div className="w-12 h-7 border rounded text-xs flex items-center justify-center bg-muted">
                        {letterSpacing}
                      </div>
                    </div>
                  </div>

                  {/* Add Text Button - Prominent placement */}
                  <Button 
                    className="w-full mt-4 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200" 
                    onClick={handleAddText}
                  >
                    + Add Text
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
                                  console.log('Text object deleted from list, updating text objects');
                                  // Update text objects list
                                  setTimeout(() => {
                                    if ((window as any).designCanvas?.updateTextObjects) {
                                      (window as any).designCanvas.updateTextObjects();
                                    }
                                  }, 100);
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
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-4 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ((window as any).designCanvas?.centerSelected) {
                          (window as any).designCanvas.centerSelected();
                        }
                      }}
                      className="h-8 text-xs"
                    >
                      Center
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ((window as any).designCanvas?.duplicateSelected) {
                          (window as any).designCanvas.duplicateSelected();
                        }
                      }}
                      className="h-8 text-xs"
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ((window as any).designCanvas?.rotateSelected) {
                          (window as any).designCanvas.rotateSelected();
                        }
                      }}
                      className="h-8 text-xs"
                    >
                      Rotate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if ((window as any).designCanvas?.deleteSelected) {
                          (window as any).designCanvas.deleteSelected();
                        }
                      }}
                      className="h-8 text-xs text-destructive"
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Local File Upload */}
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
                      <Button 
                        variant="outline" 
                        size="lg" 
                        asChild
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0"
                      >
                        <span>📁 Choose File</span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPEG, SVG up to 10MB
                    </p>
                  </div>

                  {/* Background Removal Option */}
                  {uploadedFile && (
                    <div className="mt-4 border border-primary/20 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300/40 group cursor-pointer">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              AI Background Removal
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Instantly remove backgrounds with AI
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={async () => {
                            setIsRemovingBackground(true);
                            try {
                              const imageElement = await loadImage(uploadedFile);
                              const processedBlob = await removeBackground(imageElement);
                              const processedFile = new File([processedBlob], `${uploadedFile.name.split('.')[0]}_no_bg.png`, { type: 'image/png' });
                              
                              // Find and remove the original uploaded image if it exists
                              if ((window as any).designCanvas?.canvas && uploadedImageObject) {
                                console.log('Removing original image object before adding processed image');
                                (window as any).designCanvas.canvas.remove(uploadedImageObject);
                                (window as any).designCanvas.canvas.renderAll();
                              } else if ((window as any).designCanvas?.canvas) {
                                // If we don't have the specific object reference, remove the most recent image
                                const canvas = (window as any).designCanvas.canvas;
                                const objects = canvas.getObjects();
                                const images = objects.filter((obj: any) => obj.type === 'image');
                                if (images.length > 0) {
                                  console.log('Removing most recent image object before adding processed image');
                                  canvas.remove(images[images.length - 1]);
                                  canvas.renderAll();
                                }
                              }
                              
                              // Add the processed image
                              onImageUpload(processedFile);
                              toast.success("Background removed successfully!");
                              setUploadedFile(null);
                              setUploadedImageObject(null);
                            } catch (error) {
                              toast.error("Failed to remove background");
                              console.error(error);
                            } finally {
                              setIsRemovingBackground(false);
                            }
                          }}
                          disabled={isRemovingBackground}
                          size="default"
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] group-hover:scale-[1.02]"
                        >
                          {isRemovingBackground ? (
                            <div className="flex items-center justify-center">
                              <div className="flex items-center space-x-3">
                                {/* Animated Bubbling Beaker */}
                                <div className="relative">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                    {/* Beaker body */}
                                    <path d="M8 2h8v6l4 8c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4l4-8V2z" fill="currentColor" opacity="0.3"/>
                                    {/* Beaker outline */}
                                    <path d="M8 2h8v6l4 8c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4l4-8V2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                    {/* Bubbles */}
                                    <circle cx="10" cy="14" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '0ms', animationDuration: '1s'}}/>
                                    <circle cx="14" cy="16" r="0.8" fill="currentColor" className="animate-pulse" style={{animationDelay: '300ms', animationDuration: '1.2s'}}/>
                                    <circle cx="12" cy="12" r="0.6" fill="currentColor" className="animate-pulse" style={{animationDelay: '600ms', animationDuration: '0.8s'}}/>
                                    {/* Steam/vapor lines */}
                                    <path d="M9 4c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: '200ms'}}/>
                                    <path d="M11 3c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: '500ms'}}/>
                                    <path d="M13 4c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1" fill="none" className="animate-pulse" style={{animationDelay: '800ms'}}/>
                                  </svg>
                                </div>
                                <span className="animate-pulse font-medium">Processing AI Magic...</span>
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z" />
                              </svg>
                              Remove Background
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

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

              {/* Image Elements List */}
              {imageObjects.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Image Elements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {imageObjects.map((imageObj, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border-2 cursor-pointer transition-all ${
                          selectedObject === imageObj
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          if ((window as any).designCanvas?.canvas) {
                            (window as any).designCanvas.canvas.setActiveObject(imageObj);
                            (window as any).designCanvas.canvas.renderAll();
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                              {imageObj.getSrc ? (
                                <img 
                                  src={imageObj.getSrc()} 
                                  alt="thumbnail" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">
                                Image Element
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {Math.round(imageObj.width || 0)} × {Math.round(imageObj.height || 0)}px
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((window as any).designCanvas?.canvas) {
                                  (window as any).designCanvas.canvas.setActiveObject(imageObj);
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
                                  (window as any).designCanvas.canvas.remove(imageObj);
                                  (window as any).designCanvas.canvas.renderAll();
                                  console.log('Image object deleted from list, updating image objects');
                                  // Update image objects list
                                  setTimeout(() => {
                                    if ((window as any).designCanvas?.updateImageObjects) {
                                      (window as any).designCanvas.updateImageObjects();
                                    }
                                  }, 100);
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
    </div>
  );
};