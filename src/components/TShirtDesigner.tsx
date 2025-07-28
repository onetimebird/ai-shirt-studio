import { useState } from "react";
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopControls } from "@/components/TopControls";
import { DesignCanvas } from "@/components/DesignCanvas";
import { RightPanel } from "@/components/RightPanel";
import { toast } from "sonner";

export const TShirtDesigner = () => {
  const [activeTool, setActiveTool] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState("bella-3001c");
  const [selectedColor, setSelectedColor] = useState("White");
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar 
          activeTool={activeTool} 
          onToolChange={handleToolChange} 
        />

        {/* Central Canvas */}
        <DesignCanvas
          selectedColor={selectedColor}
          currentSide={currentSide}
          activeTool={activeTool}
          onSelectedObjectChange={setSelectedObject}
          onToolChange={setActiveTool}
        />

        {/* Right Panel */}
        <RightPanel
          activeTool={activeTool}
          selectedObject={selectedObject}
          onTextPropertiesChange={handleTextPropertiesChange}
          onImageUpload={handleImageUpload}
          onProductColorChange={handleProductColorChange}
        />
      </div>
    </div>
  );
};