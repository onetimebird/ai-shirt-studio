import { useState } from "react";
// import SmokeTest from "@/components/SmokeTest"; // Uncomment to test
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopControls } from "@/components/TopControls";
import { DesignCanvas } from "@/components/DesignCanvas";
import { RightPanel } from "@/components/RightPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Settings, Type, Upload, Wand2, Package, Palette, X } from "lucide-react";
import { AIIcon } from "@/components/AIIcon";
import { AIWandIcon } from "@/components/AIWandIcon";
import { toast } from "sonner";

export const TShirtDesigner = () => {
  const [activeTool, setActiveTool] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState("gildan-2000");
  const [selectedColor, setSelectedColor] = useState("cherry-red");
  const [decorationMethod, setDecorationMethod] = useState("screen-print");
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [textObjects, setTextObjects] = useState<any[]>([]);
  const [imageObjects, setImageObjects] = useState<any[]>([]);

  const handleToolChange = (tool: string) => {
    // Handle reset tool separately - don't change activeTool
    if (tool === "reset") {
      if ((window as any).designCanvas?.canvas) {
        (window as any).designCanvas.canvas.clear();
        (window as any).designCanvas.canvas.renderAll();
        toast.success("Design reset");
      }
      return; // Don't change activeTool for reset
    }
    
    setActiveTool(tool);
    
    // Only show toast messages on desktop (when right panel is visible)
    if (window.innerWidth >= 1024) {
      // Handle tool-specific actions
      if (tool === "text") {
        toast.info("Use the right panel to add and customize text");
      } else if (tool === "upload") {
        toast.info("Use the right panel to upload images (PNG, JPEG, SVG, PDF)");
      } else if (tool === "ai") {
        toast.info("Use the right panel to generate custom artwork with AI");
      } else if (tool === "color") {
        toast.info("Use the right panel to pick colors for your text");
      } else if (tool === "products") {
        toast.info("Change products using the top controls");
      }
    }
  };

  const handleImageUpload = (file: File) => {
    console.log("TShirtDesigner handleImageUpload called with file:", file.name);
    (window as any).designCanvas?.addImage(file);
  };

  const handleTextPropertiesChange = (properties: any) => {
    // Handle text property updates
    console.log("Text properties changed:", properties);
  };

  const handleProductColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleTextObjectsUpdate = (objects: any[]) => {
    setTextObjects(objects);
  };

  const handleImageObjectsUpdate = (objects: any[]) => {
    setImageObjects(objects);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Smoke Test - Uncomment to test SVG loading */}
      {/* <SmokeTest /> */}
      
      {/* Top Controls Bar */}
      <TopControls
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
        decorationMethod={decorationMethod}
        currentSide={currentSide}
        onProductChange={setSelectedProduct}
        onColorChange={setSelectedColor}
        onDecorationChange={setDecorationMethod}
        onSideChange={setCurrentSide}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar - Always visible on desktop, hidden on mobile */}
        <div className="hidden lg:block">
          <LeftToolbar 
            activeTool={activeTool} 
            onToolChange={handleToolChange} 
          />
        </div>

        {/* Central Canvas */}
        <div className="flex-1 relative">
          <DesignCanvas
            selectedColor={selectedColor}
            currentSide={currentSide}
            selectedProduct={selectedProduct}
            activeTool={activeTool}
            onSelectedObjectChange={setSelectedObject}
            onToolChange={setActiveTool}
            onTextObjectsUpdate={handleTextObjectsUpdate}
            onImageObjectsUpdate={handleImageObjectsUpdate}
          />
        </div>

        {/* Right Panel - Only visible on desktop */}
        <div className="hidden lg:block">
          <RightPanel
            activeTool={activeTool}
            selectedObject={selectedObject}
            onTextPropertiesChange={handleTextPropertiesChange}
            onImageUpload={handleImageUpload}
            onProductColorChange={handleProductColorChange}
            textObjects={textObjects}
            imageObjects={imageObjects}
            selectedProduct={selectedProduct}
            selectedColor={selectedColor}
            onProductChange={setSelectedProduct}
          />
        </div>
      </div>

      {/* Mobile Bottom Toolbar */}
      <div className="lg:hidden bg-card border-t border-border">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Products */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "products" ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                onClick={() => handleToolChange("products")}
              >
                <Package className="h-4 w-4" />
                <span className="text-xs">Products</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Manage Your Products</SheetTitle>
                <p className="text-sm text-muted-foreground">You can select multiple products and colors.</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="products"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
                  imageObjects={(window as any).designCanvas?.imageObjects || []}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={setSelectedProduct}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Add Text */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "text" ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                onClick={() => handleToolChange("text")}
              >
                <Type className="h-4 w-4" />
                <span className="text-xs">Add Text</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Text Editor</SheetTitle>
                <p className="text-sm text-muted-foreground">Add and customize text for your design</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="text"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
                  imageObjects={(window as any).designCanvas?.imageObjects || []}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={setSelectedProduct}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Upload Art */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "upload" ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                onClick={() => handleToolChange("upload")}
              >
                <Upload className="h-4 w-4" />
                <span className="text-xs">Upload Art</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Upload Your Own Image</SheetTitle>
                <p className="text-sm text-muted-foreground">Add your custom artwork to the design</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="upload"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
                  imageObjects={(window as any).designCanvas?.imageObjects || []}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={setSelectedProduct}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Add Art (AI) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "ai" ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                onClick={() => handleToolChange("ai")}
              >
                <AIWandIcon size={16} />
                <span className="text-xs">Add Art</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Add Art <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded ml-2">AI</span></SheetTitle>
                <p className="text-sm text-muted-foreground">Generate custom artwork with AI</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="ai"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
                  imageObjects={(window as any).designCanvas?.imageObjects || []}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={setSelectedProduct}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Properties */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex flex-col items-center gap-1 h-auto py-2 px-3"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">Properties</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Properties</SheetTitle>
                <p className="text-sm text-muted-foreground">Customize selected elements</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool={activeTool}
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
                  imageObjects={(window as any).designCanvas?.imageObjects || []}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={setSelectedProduct}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};