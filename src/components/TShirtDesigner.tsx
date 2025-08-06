import { useState } from "react";
// import SmokeTest from "@/components/SmokeTest"; // Uncomment to test
import { LeftToolbar } from "@/components/LeftToolbar";
import { TopControls } from "@/components/TopControls";
import { BottomBar } from "@/components/BottomBar";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { CanvasControls } from "@/components/CanvasControls";
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
  const [selectedProduct, setSelectedProduct] = useState("gildan-64000");
  const [selectedColor, setSelectedColor] = useState("cherry-red");
  const [decorationMethod, setDecorationMethod] = useState("screen-print");
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [textObjects, setTextObjects] = useState<any[]>([]);
  const [imageObjects, setImageObjects] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const loadDesignData = (designData: any) => {
    console.log('[TShirtDesigner] loadDesignData called with:', designData);
    const canvas = (window as any).designCanvas?.canvas;
    console.log('[TShirtDesigner] Canvas exists:', !!canvas);
    if (!canvas || !designData) return;

    // Store background objects before loading
    const backgroundObjects = canvas.getObjects().filter((obj: any) => obj.isBackground);
    console.log('[TShirtDesigner] Background objects found:', backgroundObjects.length);

    // Clear canvas except for background objects
    const objects = canvas.getObjects();
    console.log('[TShirtDesigner] Current canvas objects before clear:', objects.length);
    objects.forEach((obj: any) => {
      if (!obj.isBackground) {
        canvas.remove(obj);
      }
    });

    // Load the saved design
    if (designData.canvasData) {
      console.log('[TShirtDesigner] Loading canvas data:', designData.canvasData);
      
      // Create a temporary canvas data that includes only non-background objects
      const filteredCanvasData = {
        ...designData.canvasData,
        objects: designData.canvasData.objects ? designData.canvasData.objects.filter((objData: any) => !objData.isBackground) : []
      };
      
      console.log('[TShirtDesigner] Filtered objects to load:', filteredCanvasData.objects.length);
      
      if (filteredCanvasData.objects.length > 0) {
        // Load only the non-background objects
        canvas.loadFromJSON(filteredCanvasData, () => {
          // Ensure background objects are still there after loading
          backgroundObjects.forEach(bgObj => {
            if (!canvas.getObjects().find((obj: any) => obj === bgObj)) {
              canvas.add(bgObj);
              canvas.sendToBack(bgObj);
            }
          });
          canvas.renderAll();
          console.log('[TShirtDesigner] Canvas objects after load:', canvas.getObjects().length);
        });
      } else {
        console.log('[TShirtDesigner] No objects to load');
        canvas.renderAll();
      }
    } else {
      console.log('[TShirtDesigner] No canvasData found in design data');
    }
  };

  const handleToolChange = (tool: string) => {
    // Handle reset tool separately - don't change activeTool
    if (tool === "reset") {
      if ((window as any).designCanvas?.canvas) {
        const canvas = (window as any).designCanvas.canvas;
        // Remove all objects except the background image
        const objects = canvas.getObjects();
        objects.forEach((obj: any) => {
          canvas.remove(obj);
        });
        canvas.renderAll();
        // Reset the object tracking arrays
        setTextObjects([]);
        setImageObjects([]);
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
    setUploadedFile(file); // Store the uploaded file for background removal
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Smoke Test - Uncomment to test SVG loading */}
      {/* <SmokeTest /> */}
      
      {/* Top Controls Bar - Sticky */}
      <div className="sticky top-0 z-50 flex-shrink-0">
        <TopControls 
          onAuthModalChange={setIsAuthModalOpen} 
          onCartModalChange={setIsCartModalOpen}
          selectedProduct={selectedProduct}
          selectedColor={selectedColor}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left Toolbar - Sticky sidebar */}
        <div className="hidden md:block flex-shrink-0 sticky top-0 h-screen">
          <div className="h-full overflow-y-auto">
        <LeftToolbar 
          activeTool={activeTool} 
          onToolChange={handleToolChange}
          designData={{ textObjects, imageObjects }}
          productType={selectedProduct}
          productColor={selectedColor}
          onShareModalChange={setIsShareModalOpen}
        />
          </div>
        </div>

        {/* Central Canvas - Fixed height, no scrolling */}
        <div className="flex-1 relative min-w-0 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 relative">
            {/* Canvas Controls - positioned over canvas, hidden on mobile when sheets are open */}
            {(!isMobileSheetOpen || window.innerWidth >= 768) && (
              <CanvasControls
                currentSide={currentSide}
                onSideChange={setCurrentSide}
                isAuthModalOpen={isAuthModalOpen}
                isCartModalOpen={isCartModalOpen}
                isSaveModalOpen={isSaveModalOpen}
                isLoadPanelOpen={isLoadPanelOpen}
                isShareModalOpen={isShareModalOpen}
              />
            )}
            
            <div className="w-full max-w-4xl flex items-center justify-center">
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
          </div>
        </div>

        {/* Right Panel - Sticky sidebar */}
        <div className="hidden xl:block w-80 2xl:w-96 sticky top-0 h-screen border-l border-border">
          <div className="h-full overflow-y-auto scrollbar-hide bg-card">
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
            uploadedFile={uploadedFile}
          />
          </div>
        </div>
      </div>

      {/* Desktop Bottom Bar */}
      <div className="hidden md:block flex-shrink-0">
        <BottomBar
          selectedProduct={selectedProduct}
          selectedColor={selectedColor}
          decorationMethod={decorationMethod}
          onProductChange={setSelectedProduct}
          onColorChange={setSelectedColor}
          onDecorationChange={setDecorationMethod}
          onSaveModalChange={setIsSaveModalOpen}
          onLoadPanelChange={setIsLoadPanelOpen}
        />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden flex-shrink-0">
        <MobileBottomBar
          selectedProduct={selectedProduct}
          selectedColor={selectedColor}
          decorationMethod={decorationMethod}
          onProductChange={setSelectedProduct}
          onColorChange={setSelectedColor}
          onDecorationChange={setDecorationMethod}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          selectedObject={selectedObject}
          onTextPropertiesChange={handleTextPropertiesChange}
          onImageUpload={handleImageUpload}
          onProductColorChange={handleProductColorChange}
          textObjects={textObjects}
          imageObjects={imageObjects}
          uploadedFile={uploadedFile}
          onSheetOpenChange={setIsMobileSheetOpen}
          onLoadDesign={loadDesignData}
          onShareModalChange={setIsShareModalOpen}
        />
      </div>
    </div>
  );
};