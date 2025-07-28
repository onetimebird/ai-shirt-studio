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
      (window as any).designCanvas?.addText();
    } else if (tool === "wizard") {
      toast.info("Design Wizard will help you create amazing designs!");
    } else if (tool === "names") {
      toast.info("Names & Numbers tool for team customization");
    } else if (tool === "clipart") {
      toast.info("Browse our clipart library for graphics");
    }
  };

  const handleImageUpload = (file: File) => {
    (window as any).designCanvas?.addImage(file);
  };

  const handleTextPropertiesChange = (properties: any) => {
    // Handle text property updates
    console.log("Text properties changed:", properties);
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
        />

        {/* Right Panel */}
        <RightPanel
          activeTool={activeTool}
          selectedObject={selectedObject}
          onTextPropertiesChange={handleTextPropertiesChange}
          onImageUpload={handleImageUpload}
        />
      </div>
    </div>
  );
};