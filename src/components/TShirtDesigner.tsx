import { useState } from "react";
// import SmokeTest from "@/components/SmokeTest"; // Uncomment to test
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopControls } from "@/components/TopControls";
import { DesignCanvas } from "@/components/DesignCanvas";
import { RightPanel } from "@/components/RightPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Type, Upload, Wand2, Package, Palette } from "lucide-react";
import { toast } from "sonner";

export const TShirtDesigner = () => {
  const [activeTool, setActiveTool] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState("gildan-2000");
  const [selectedColor, setSelectedColor] = useState("cherry-red");
  const [decorationMethod, setDecorationMethod] = useState("screen-print");
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const handleToolChange = (tool: string) => {
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
    
    if (tool === "reset") {
      if ((window as any).designCanvas?.canvas) {
        (window as any).designCanvas.canvas.clear();
        (window as any).designCanvas.canvas.renderAll();
        toast.success("Design reset");
      }
    }
  };

  const handleImageUpload = (file: File) => {
    (window as any).designCanvas?.addImage(file);
  };

  const handleTextPropertiesChange = (properties: any) => {
    // Handle text property updates
    console.log("Text properties changed:", properties);
  };

  const handleProductColorChange = (color: string) => {
    setSelectedColor(color);
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
            activeTool={activeTool}
            onSelectedObjectChange={setSelectedObject}
            onToolChange={setActiveTool}
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
            textObjects={(window as any).designCanvas?.textObjects || []}
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
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Change Product</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">
                <RightPanel
                  activeTool="products"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
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
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Add Text</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">
                <RightPanel
                  activeTool="text"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
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
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Upload Art</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">
                <RightPanel
                  activeTool="upload"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
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
                <Wand2 className="h-4 w-4" />
                <span className="text-xs">Add Art</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>AI Art Generator</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">
                <RightPanel
                  activeTool="ai"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
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
            <SheetContent side="bottom" className="h-[80vh] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Properties</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto p-4">
                <RightPanel
                  activeTool={activeTool}
                  selectedObject={selectedObject}
                  onTextPropertiesChange={handleTextPropertiesChange}
                  onImageUpload={handleImageUpload}
                  onProductColorChange={handleProductColorChange}
                  textObjects={(window as any).designCanvas?.textObjects || []}
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