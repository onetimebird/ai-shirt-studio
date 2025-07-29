import { useState } from "react";
// import SmokeTest from "@/components/SmokeTest"; // Uncomment to test
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopControls } from "@/components/TopControls";
import { DesignCanvas } from "@/components/DesignCanvas";
import { RightPanel } from "@/components/RightPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings } from "lucide-react";
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
    } else if (tool === "reset") {
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
        {/* Left Toolbar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
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
          
          {/* Mobile Floating Action Buttons */}
          <div className="md:hidden absolute bottom-4 left-4 flex flex-col gap-2">
            {/* Mobile Tools Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="icon" className="rounded-full shadow-lg">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Design Tools</SheetTitle>
                </SheetHeader>
                <div className="p-2">
                  <LeftToolbar 
                    activeTool={activeTool} 
                    onToolChange={handleToolChange}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Properties Panel */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="default" size="icon" className="rounded-full shadow-lg">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Properties</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto">
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
    </div>
  );
};