import { useState, useEffect } from "react";
import { applyCustomControlsToObject } from '@/lib/fabricTextControls';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { openAIService } from "@/services/openai";
import { Text as FabricText, Textbox as FabricTextbox } from "fabric";
import { AIArtPanel } from "@/components/AIArtPanel";
import { CustomColorPicker } from "@/components/CustomColorPicker";
import { ProductSelector } from "@/components/ProductSelector";
import { ImageEditPanel } from "@/components/ImageEditPanel";
import {
  Type,
  ChevronDown,
  Palette,
  Image as ImageIcon,
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
import { BELLA_3001C_COLORS } from "../data/bellaColors";
import { GILDAN_64000_COLORS } from "../data/gildan64000Colors";
import { BELLA_6400_COLORS } from "../data/bella6400Colors";
import { GILDAN_18000_COLORS } from "../data/gildan18000Colors";
import { GILDAN_18500_COLORS } from "../data/gildan18500Colors";
import { BELLA_3719_COLORS } from "../data/bella3719Colors";
import LayersDropdown from "./LayersDropdown";

// Bootstrap Icons as React Components
const TextLeftIcon = () => <img src="/icons/text-left.svg" className="w-[14px] h-[14px]" alt="Align Left" />;
const TextCenterIcon = () => <img src="/icons/text-center.svg" className="w-[14px] h-[14px]" alt="Align Center" />;
const TextRightIcon = () => <img src="/icons/text-right.svg" className="w-[14px] h-[14px]" alt="Align Right" />;
const TypeBoldIcon = () => <img src="/icons/type-bold.svg" className="w-[14px] h-[14px]" alt="Bold" />;
const TypeItalicIcon = () => <img src="/icons/type-italic.svg" className="w-[14px] h-[14px]" alt="Italic" />;
const TypeUnderlineIcon = () => <img src="/icons/type-underline.svg" className="w-[14px] h-[14px]" alt="Underline" />;
const LayersIcon = () => <img src="/icons/layers.svg" className="w-4 h-4" alt="Layers" />;
const FrontIcon = () => <img src="/icons/front.svg" className="w-4 h-4" alt="Bring to Front" />;
const BackIcon = () => <img src="/icons/back.svg" className="w-4 h-4" alt="Send to Back" />;
const LayerForwardIcon = () => <img src="/icons/layer-forward.svg" className="w-4 h-4" alt="Bring Forward" />;
const LayerBackwardIcon = () => <img src="/icons/layer-backward.svg" className="w-4 h-4" alt="Send Backward" />;
const CloudUploadIcon = () => <img src="/icons/cloud-upload.svg" className="w-4 h-4" alt="Upload" />;
const UploadImageIcon = () => <img src="/icons/image.svg" className="w-4 h-4" alt="Image" />;
const FolderPlusIcon = () => <img src="/icons/folder-plus.svg" className="w-4 h-4 brightness-0 invert" alt="Choose File" />;
const GoogleDriveIcon = () => <img src="/icons/google-drive-2020.svg" className="w-5 h-5" alt="Google Drive" />;
const GoogleDriveFolderIcon = () => <img src="/icons/google-drive-2020.svg" className="w-4 h-4 mr-2" alt="Google Drive" />;

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
  uploadedFile?: File | null;
}

const FONTS = [
  // System Fonts
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Impact", value: "Impact" },
  
  // Essential T-Shirt Design Fonts
  { name: "Oswald", value: "Oswald" },
  { name: "Anton", value: "Anton" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Inter", value: "Inter" },
  
  // Collegiate & Athletic Fonts
  { name: "Graduate", value: "Graduate" },
  { name: "Alfa Slab One", value: "Alfa Slab One" },
  { name: "Black Ops One", value: "Black Ops One" },
  { name: "Staatliches", value: "Staatliches" },
  { name: "Squada One", value: "Squada One" },
  { name: "Big Shoulders Display", value: "Big Shoulders Display" },
  { name: "Concert One", value: "Concert One" },
  { name: "Press Start 2P", value: "Press Start 2P" },
  { name: "Rajdhani", value: "Rajdhani" },
  { name: "Play", value: "Play" },
  { name: "Saira Condensed", value: "Saira Condensed" },
  
  // Bold Sports & Team Fonts
  { name: "Russo One", value: "Russo One" },
  { name: "Righteous", value: "Righteous" },
  { name: "Archivo Black", value: "Archivo Black" },
  { name: "Fjalla One", value: "Fjalla One" },
  { name: "Fugaz One", value: "Fugaz One" },
  { name: "Titan One", value: "Titan One" },
  { name: "Bowlby One", value: "Bowlby One" },
  { name: "Bungee", value: "Bungee" },
  { name: "Bungee Shade", value: "Bungee Shade" },
  { name: "Teko", value: "Teko" },
  
  // Fun & Decorative
  { name: "Bangers", value: "Bangers" },
  { name: "Fredoka One", value: "Fredoka One" },
  { name: "Fredoka", value: "Fredoka" },
  { name: "Permanent Marker", value: "Permanent Marker" },
  { name: "Creepster", value: "Creepster" },
  { name: "Passion One", value: "Passion One" },
  { name: "Acme", value: "Acme" },
  
  // Script & Elegant
  { name: "Pacifico", value: "Pacifico" },
  { name: "Dancing Script", value: "Dancing Script" },
  { name: "Lobster", value: "Lobster" },
  { name: "Satisfy", value: "Satisfy" },
  { name: "Playfair Display", value: "Playfair Display" },
  
  // Modern & Tech (Perfect for Esports)
  { name: "Orbitron", value: "Orbitron" },
  { name: "Audiowide", value: "Audiowide" },
  { name: "Exo", value: "Exo" },
  { name: "Michroma", value: "Michroma" },
  { name: "Electrolize", value: "Electrolize" },
  
  // Clean & Professional
  { name: "Nunito", value: "Nunito" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Raleway", value: "Raleway" },
  { name: "Work Sans", value: "Work Sans" },
  { name: "Rubik", value: "Rubik" },
  { name: "Barlow", value: "Barlow" },
  { name: "Kanit", value: "Kanit" },
  { name: "Saira", value: "Saira" },
  { name: "Changa", value: "Changa" },
  { name: "Roboto Condensed", value: "Roboto Condensed" },
  
  // Serif & Classic
  { name: "Merriweather", value: "Merriweather" },
  { name: "PT Sans", value: "PT Sans" },
  { name: "Crimson Text", value: "Crimson Text" },
  { name: "Abril Fatface", value: "Abril Fatface" },
  
  // Rounded & Friendly
  { name: "Comfortaa", value: "Comfortaa" },
  { name: "Quicksand", value: "Quicksand" },
  { name: "Josefin Sans", value: "Josefin Sans" },
  { name: "Kalam", value: "Kalam" },

  // NEW: Advanced Collegiate/Athletic/Sports Fonts
  { name: "Big Shoulders Stencil Display", value: "Big Shoulders Stencil Display" },
  { name: "Alumni Sans", value: "Alumni Sans" },
  { name: "Anton SC", value: "Anton SC" },
  { name: "Bungee Outline", value: "Bungee Outline" },
  { name: "Faster One", value: "Faster One" },
  { name: "Chakra Petch", value: "Chakra Petch" },
  { name: "Syncopate", value: "Syncopate" },
  { name: "Kranky", value: "Kranky" },
  { name: "Frijole", value: "Frijole" },
  { name: "Metal Mania", value: "Metal Mania" },
  { name: "Hanalei Fill", value: "Hanalei Fill" },
  { name: "Bungee Hairline", value: "Bungee Hairline" },
  { name: "Wallpoet", value: "Wallpoet" },
  { name: "Eater", value: "Eater" },
  { name: "Jolly Lodger", value: "Jolly Lodger" },
  { name: "Griffy", value: "Griffy" },
  { name: "Lacquer", value: "Lacquer" },
  { name: "Rye", value: "Rye" },
  { name: "UnifrakturCook", value: "UnifrakturCook" },
  { name: "Fredericka the Great", value: "Fredericka the Great" },
  { name: "Rammetto One", value: "Rammetto One" },
  { name: "Covered By Your Grace", value: "Covered By Your Grace" },
  { name: "Shadows Into Light", value: "Shadows Into Light" },
  { name: "Special Elite", value: "Special Elite" },
  { name: "Monoton", value: "Monoton" },
  { name: "Megrim", value: "Megrim" },
  { name: "Nosifer", value: "Nosifer" },
  { name: "Butcherman", value: "Butcherman" },
  { name: "New Rocker", value: "New Rocker" },
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
  onProductChange,
  uploadedFile
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
  const [uploadedImageObject, setUploadedImageObject] = useState<any>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [lovableApiKey, setLovableApiKey] = useState<string>(localStorage.getItem('lovable_ai_key') || '');

  const UPSCALE_PROMPT = `
Enhance the resolution of this image by a factor of 4.
Sharpen fine details, reduce noise and JPEG artifacts,
and return a high-quality transparent PNG suitable for print.
`;

  // Sync with selectedObject 
  useEffect(() => {
    console.log('[RightPanel] selectedObject changed:', selectedObject?.type, selectedObject);
    console.log('[RightPanel] selectedObject truthy?', !!selectedObject);
    console.log('[RightPanel] selectedObject type check:', selectedObject?.type);
    if (selectedObject && (selectedObject.type === "textbox" || selectedObject.type === "text")) {
      console.log('[RightPanel] Syncing text properties from selected object');
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
      console.log('[RightPanel] Text properties synced, color is:', selectedObject.fill);
    } else {
      console.log('[RightPanel] No text object selected or wrong type');
    }
  }, [selectedObject]);

  const updateTextProperty = (property: string, value: any) => {
    console.log('[RightPanel] updateTextProperty called:', property, value);
    console.log('[RightPanel] Current selectedObject:', selectedObject);
    
    if ((window as any).designCanvas?.updateSelectedTextProperty) {
      console.log('[RightPanel] Calling updateSelectedTextProperty');
      (window as any).designCanvas.updateSelectedTextProperty(property, value);
    } else {
      console.log('[RightPanel] updateSelectedTextProperty method not found');
      console.log('[RightPanel] Available methods:', Object.keys((window as any).designCanvas || {}));
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
        fontFamily: fontFamily,
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
    
    console.log('[RightPanel] Created text object with fontFamily:', textObject.fontFamily);

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
      applyCustomControlsToObject(textbox);
      fabricCanvas.setActiveObject(textbox);
    } else {
      console.log("[Debug] Adding single-line text to canvas");
      fabricCanvas.add(textObject);
      fabricCanvas.bringObjectToFront(textObject);
      applyCustomControlsToObject(textObject);
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

  const handleLayerAction = (action: string) => {
    if (!selectedObject) return;
    
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return;

    switch (action) {
      case 'bringToFront':
        if (typeof selectedObject.bringToFront === 'function') {
          selectedObject.bringToFront();
        } else if (canvas.bringToFront) {
          canvas.bringToFront(selectedObject);
        }
        break;
      case 'sendToBack':
        if (typeof selectedObject.sendToBack === 'function') {
          selectedObject.sendToBack();
        } else if (canvas.sendToBack) {
          canvas.sendToBack(selectedObject);
        }
        break;
      case 'bringForward':
        if (typeof selectedObject.bringForward === 'function') {
          selectedObject.bringForward();
        } else if (canvas.bringForward) {
          canvas.bringForward(selectedObject);
        }
        break;
      case 'sendBackward':
        if (typeof selectedObject.sendBackward === 'function') {
          selectedObject.sendBackward();
        } else if (canvas.sendBackward) {
          canvas.sendBackward(selectedObject);
        }
        break;
    }
    canvas.renderAll();
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
      case "edit-image":
        return "edit-image";
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
        ) : activeTool === "edit-image" ? (
          // Edit image tool header
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 transition-all duration-200 hover:text-primary hover:drop-shadow-sm cursor-default">
              Edit Image
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
                          {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value} className="text-xs">
                              <span style={{ fontFamily: font.value }}>{font.name}</span>
                            </SelectItem>
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
                       <CustomColorPicker
                         value={selectedObject ? (selectedObject.fill || "#000000") : textColor}
                         onChange={(color) => {
                           console.log('[RightPanel] CustomColorPicker changed to:', color);
                           setTextColor(color);
                           if (selectedObject) {
                             updateTextProperty('fill', color);
                           }
                         }}
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
                        <CustomColorPicker
                          value={strokeColor}
                          onChange={(color) => {
                            console.log('[RightPanel] Stroke color changed to:', color);
                            setStrokeColor(color);
                            updateTextProperty('stroke', color);
                          }}
                          className="w-8 h-7"
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
                        <TypeBoldIcon />
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
                        <TypeItalicIcon />
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
                        <TypeUnderlineIcon />
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
                        <TextLeftIcon />
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
                        <TextCenterIcon />
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
                        <TextRightIcon />
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

                  {/* Layer Controls */}
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Layer Controls</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLayerAction('bringToFront')}
                        disabled={!selectedObject}
                        className="text-xs h-8"
                      >
                        Bring to Front
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLayerAction('bringForward')}
                        disabled={!selectedObject}
                        className="text-xs h-8"
                      >
                        Bring Forward
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLayerAction('sendBackward')}
                        disabled={!selectedObject}
                        className="text-xs h-8"
                      >
                        Send Backward
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLayerAction('sendToBack')}
                        disabled={!selectedObject}
                        className="text-xs h-8"
                      >
                        Send to Back
                      </Button>
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
                              className="h-10 w-10 p-2 hover:bg-accent transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((window as any).designCanvas?.canvas) {
                                  (window as any).designCanvas.canvas.setActiveObject(textObj);
                                  (window as any).designCanvas.duplicateSelected();
                                }
                              }}
                            >
                              <Copy className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
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
                              <Trash2 className="w-6 h-6" />
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
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" /> Edit Selected Text
                  </div>
                  <LayersDropdown
                    onBringToFront={() => handleLayerAction('bringToFront')}
                    onSendToBack={() => handleLayerAction('sendToBack')}
                    onBringForward={() => handleLayerAction('bringForward')}
                    onSendBackward={() => handleLayerAction('sendBackward')}
                  />
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
                      {FONTS.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
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
                      <input
                        type="color"
                        value={textColor}
                        onChange={e => {
                          console.log('[RightPanel] Bottom color picker onChange triggered');
                          setTextColor(e.target.value);
                          updateTextProperty('fill', e.target.value);
                        }}
                        className="w-12 h-8 border rounded cursor-pointer"
                        style={{ 
                          padding: 0,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        title="Click to select color"
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
                          <TypeBoldIcon />
                        </Button>
                        <Button 
                          variant={isItalic ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => {
                            setIsItalic(!isItalic);
                            updateTextProperty('fontStyle', !isItalic ? 'italic' : 'normal');
                          }}
                        >
                          <TypeItalicIcon />
                        </Button>
                        <Button 
                          variant={isUnderline ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => {
                            setIsUnderline(!isUnderline);
                            updateTextProperty('underline', !isUnderline);
                          }}
                        >
                          <TypeUnderlineIcon />
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
                          <TextLeftIcon />
                        </Button>
                        <Button 
                          variant={textAlign==='center'?'default':'outline'} 
                          size="sm" 
                          onClick={() => {
                            setTextAlign('center');
                            updateTextProperty('textAlign', 'center');
                          }}
                        >
                          <TextCenterIcon />
                        </Button>
                        <Button 
                          variant={textAlign==='right'?'default':'outline'} 
                          size="sm" 
                          onClick={() => {
                            setTextAlign('right');
                            updateTextProperty('textAlign', 'right');
                          }}
                        >
                          <TextRightIcon />
                        </Button>
                      </div>
                    </div>

                    {/* Layer Controls - prominently placed */}
                    <div>
                      <Label className="text-xs mb-1 font-medium">Layer Controls</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLayerAction('bringToFront')}
                          disabled={!selectedObject}
                          className="text-xs h-8 flex items-center gap-1"
                        >
                          <FrontIcon />
                          Bring to Front
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLayerAction('bringForward')}
                          disabled={!selectedObject}
                          className="text-xs h-8 flex items-center gap-1"
                        >
                          <LayerForwardIcon />
                          Bring Forward
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLayerAction('sendBackward')}
                          disabled={!selectedObject}
                          className="text-xs h-8 flex items-center gap-1"
                        >
                          <LayerBackwardIcon />
                          Send Backward
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLayerAction('sendToBack')}
                          disabled={!selectedObject}
                          className="text-xs h-8 flex items-center gap-1"
                        >
                          <BackIcon />
                          Send to Back
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
                    <UploadImageIcon /> Upload Image
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
                        <span className="flex items-center gap-2">
                          <FolderPlusIcon />
                          Choose File
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      PNG, JPEG, SVG up to 10MB
                    </p>
                  </div>

                  {/* Background Removal Option - Debug: uploadedFile=${uploadedFile?.name || 'null'} */}
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
                              // Convert file to data URL for Replicate
                              const reader = new FileReader();
                              const imageDataUrl = await new Promise<string>((resolve) => {
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.readAsDataURL(uploadedFile);
                              });
                              
                              // Call Replicate background removal
                              const { data, error } = await supabase.functions.invoke('remove-background-replicate', {
                                body: { 
                                  imageUrl: imageDataUrl,
                                  model: 'u2net' // Best model for t-shirt graphics
                                }
                              });

                              if (error) {
                                console.error('Replicate removal error:', error);
                                throw new Error(error.message || 'Background removal failed');
                              }

                              if (!data?.success || !data?.output_url) {
                                throw new Error('No output from background removal');
                              }

                              // Fetch the processed image
                              const response = await fetch(data.output_url);
                              const blob = await response.blob();
                              const processedFile = new File([blob], `${uploadedFile.name.split('.')[0]}_no_bg.png`, { type: 'image/png' });
                              
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
                              toast.success(`Background removed in ${data.processing_time}s`);
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
                            <div className="flex items-center justify-center w-full py-2 animate-pulse">
                              {/* Much Bigger Animated Bubbling Beaker */}
                              <div className="relative mr-4">
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                                  {/* Beaker body */}
                                  <path d="M8 2h8v6l4 8c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4l4-8V2z" fill="currentColor" opacity="0.4"/>
                                  {/* Beaker outline */}
                                  <path d="M8 2h8v6l4 8c0 2.21-1.79 4-4 4H8c-2.21 0-4-1.79-4-4l4-8V2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                  {/* Bubbles */}
                                  <circle cx="10" cy="14" r="1.2" fill="currentColor" className="animate-pulse" style={{animationDelay: '0ms', animationDuration: '1s'}}/>
                                  <circle cx="14" cy="16" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '300ms', animationDuration: '1.2s'}}/>
                                  <circle cx="12" cy="12" r="0.8" fill="currentColor" className="animate-pulse" style={{animationDelay: '600ms', animationDuration: '0.8s'}}/>
                                  <circle cx="11" cy="15" r="0.6" fill="currentColor" className="animate-pulse" style={{animationDelay: '900ms', animationDuration: '1.1s'}}/>
                                  {/* Steam/vapor lines */}
                                  <path d="M9 4c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '200ms'}}/>
                                  <path d="M11 3c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '500ms'}}/>
                                  <path d="M13 4c0-1 1-1 1 0s-1 1-1 0" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '800ms'}}/>
                                </svg>
                              </div>
                              <span className="font-medium">Processing AI Magic</span>
                            </div>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z" />
                              </svg>
                              Remove Background
                            </>
                          )}
                        </Button>

                        {/* AI Upscaler */}
                        <Button
                          onClick={async () => {
                            if (!lovableApiKey) {
                              toast.error("Please enter your Lovable AI API key first");
                              return;
                            }
                            
                            setIsUpscaling(true);
                            try {
                              const form = new FormData();
                              form.append('model', 'nightmareai/real-esrgan:latest');
                              form.append('prompt', UPSCALE_PROMPT);
                              form.append('inputs', JSON.stringify({
                                image: uploadedFile,
                                scale: 4,
                                face_enhance: false
                              }));
                              
                              const res = await fetch('https://api.lovable.ai/v1/inference', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${lovableApiKey}`
                                },
                                body: form
                              });
                              
                              if (!res.ok) {
                                const errorText = await res.text();
                                throw new Error(errorText);
                              }
                              
                              const payload = await res.json();
                              const upscaledUrl = payload.outputs[0].url;
                              
                              // Download the upscaled image and convert to file
                              const upscaledResponse = await fetch(upscaledUrl);
                              const upscaledBlob = await upscaledResponse.blob();
                              const upscaledFile = new File([upscaledBlob], `${uploadedFile.name.split('.')[0]}_4x.png`, { type: 'image/png' });
                              
                              // Remove original image and add upscaled version
                              if ((window as any).designCanvas?.canvas && uploadedImageObject) {
                                (window as any).designCanvas.canvas.remove(uploadedImageObject);
                                (window as any).designCanvas.canvas.renderAll();
                              }
                              
                              onImageUpload(upscaledFile);
                              toast.success("Image upscaled successfully!");
                              setUploadedImageObject(null);
                            } catch (error) {
                              toast.error("Failed to upscale image: " + (error as Error).message);
                              console.error(error);
                            } finally {
                              setIsUpscaling(false);
                            }
                          }}
                          disabled={isUpscaling}
                          size="default"
                          className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mt-2"
                        >
                          {isUpscaling ? (
                            <div className="flex items-center justify-center w-full py-2 animate-pulse">
                              {/* Upscaling Icon */}
                              <div className="relative mr-4">
                                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                                  {/* Base square */}
                                  <rect x="6" y="6" width="4" height="4" fill="currentColor" opacity="0.4" className="animate-pulse"/>
                                  {/* Expanded square */}
                                  <rect x="12" y="12" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '300ms'}}/>
                                  {/* Arrow */}
                                  <path d="m9 9 4 4" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{animationDelay: '600ms'}}/>
                                  <path d="m11 13 2-2 2 2" stroke="currentColor" strokeWidth="1.5" fill="none" className="animate-pulse" style={{animationDelay: '900ms'}}/>
                                </svg>
                              </div>
                              <span className="font-medium">Upscaling 4x</span>
                            </div>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                              AI Upscaler (4x)
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* API Key Input for Lovable AI */}
                  {uploadedFile && (
                    <div className="border border-border rounded-lg p-4 mb-4">
                      <Label className="text-sm font-medium mb-2 block">Lovable AI API Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter your Lovable AI API key"
                        value={lovableApiKey}
                        onChange={(e) => {
                          setLovableApiKey(e.target.value);
                          localStorage.setItem('lovable_ai_key', e.target.value);
                        }}
                        className="mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Required for AI upscaling. Your key is stored locally and only used for API calls.
                      </p>
                    </div>
                  )}

                  {/* Google Drive Upload */}
                  <div className="border border-border rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <GoogleDriveIcon />
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
                      <GoogleDriveFolderIcon />
                      Upload from Drive
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
                              className="h-10 w-10 p-2 hover:bg-accent transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                if ((window as any).designCanvas?.canvas) {
                                  (window as any).designCanvas.canvas.setActiveObject(imageObj);
                                  (window as any).designCanvas.duplicateSelected();
                                }
                              }}
                            >
                              <Copy className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-2 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
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
                              <Trash2 className="w-6 h-6" />
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
                {(() => {
                  const availableColors = selectedProduct === "bella-3001c" 
                    ? BELLA_3001C_COLORS 
                    : selectedProduct === "gildan-64000"
                    ? GILDAN_64000_COLORS
                    : selectedProduct === "bella-6400"
                    ? BELLA_6400_COLORS
                    : selectedProduct === "gildan-18000"
                    ? GILDAN_18000_COLORS
                    : selectedProduct === "gildan-18500"
                    ? GILDAN_18500_COLORS
                    : selectedProduct === "bella-3719"
                    ? BELLA_3719_COLORS
                    : BELLA_3001C_COLORS;
                  
                  return availableColors.map((colorItem) => (
                    <button
                      key={colorItem.value}
                      className="w-12 h-12 rounded border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: colorItem.value }}
                      onClick={() => onProductColorChange(colorItem.value)}
                      title={colorItem.label}
                    />
                  ));
                })()}
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

          {/* Layer Management - Show for any selected object */}
          <div>
            <p style={{color: 'blue', fontWeight: 'bold'}}>DEBUG: selectedObject = {selectedObject ? 'EXISTS' : 'NULL'}</p>
            <p style={{color: 'blue', fontWeight: 'bold'}}>DEBUG: selectedObject.type = {selectedObject?.type || 'UNDEFINED'}</p>
          </div>
          {selectedObject && (
            <div>
              <p style={{color: 'red', fontWeight: 'bold'}}>DEBUG: Layer section is rendering for selectedObject: {selectedObject.type}</p>
            </div>
          )}
          {selectedObject && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Layer Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <LayersDropdown
                    onBringToFront={() => {
                      const canvas = (window as any).designCanvas?.canvas;
                      const obj = canvas?.getActiveObject?.() || selectedObject;
                      if (!canvas || !obj) return toast.error("No object selected");
                      if ((canvas as any).bringObjectToFront) canvas.bringObjectToFront(obj);
                      else if ((canvas as any).bringToFront) (canvas as any).bringToFront(obj);
                      obj.setCoords?.();
                      canvas.renderAll?.();
                      toast.success("Brought to front");
                    }}
                    onSendToBack={() => {
                      const canvas = (window as any).designCanvas?.canvas;
                      const obj = canvas?.getActiveObject?.() || selectedObject;
                      if (!canvas || !obj) return toast.error("No object selected");
                      if ((canvas as any).sendObjectToBack) canvas.sendObjectToBack(obj);
                      else if ((canvas as any).sendToBack) (canvas as any).sendToBack(obj);
                      obj.setCoords?.();
                      canvas.renderAll?.();
                      toast.success("Sent to back");
                    }}
                    onBringForward={() => {
                      const canvas = (window as any).designCanvas?.canvas;
                      const obj = canvas?.getActiveObject?.() || selectedObject;
                      if (!canvas || !obj) return toast.error("No object selected");
                      if ((canvas as any).bringObjectForward) (canvas as any).bringObjectForward(obj);
                      else if ((canvas as any).bringForward) (canvas as any).bringForward(obj);
                      obj.setCoords?.();
                      canvas.renderAll?.();
                      toast.success("Brought forward");
                    }}
                    onSendBackward={() => {
                      const canvas = (window as any).designCanvas?.canvas;
                      const obj = canvas?.getActiveObject?.() || selectedObject;
                      if (!canvas || !obj) return toast.error("No object selected");
                      if ((canvas as any).sendObjectBackwards) (canvas as any).sendObjectBackwards(obj);
                      else if ((canvas as any).sendBackwards) (canvas as any).sendBackwards(obj);
                      obj.setCoords?.();
                      canvas.renderAll?.();
                      toast.success("Sent backward");
                    }}
                  />
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

        <TabsContent value="edit-image" className="space-y-4 mt-4">
          {selectedObject && selectedObject.type === 'image' && (
            <ImageEditPanel 
              imageUrl={selectedObject.src || selectedObject._originalElement?.src || selectedObject._element?.src}
              onClose={() => {
                // Clear selection when closing edit panel
                if ((window as any).designCanvas?.canvas) {
                  (window as any).designCanvas.canvas.discardActiveObject();
                  (window as any).designCanvas.canvas.renderAll();
                }
              }}
              onSave={(editedImageUrl) => {
                // Handle saving edited image
                toast.success("Image changes applied!");
              }}
            />
          )}
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