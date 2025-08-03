import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UndoRedoControls } from "@/components/UndoRedoControls";
import { SaveDesignModal } from "@/components/SaveDesignModal";
import { SavedDesignsPanel } from "@/components/SavedDesignsPanel";
import { Save, FolderOpen } from "lucide-react";

interface CanvasControlsProps {
  currentSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  isAuthModalOpen?: boolean;
  isCartModalOpen?: boolean;
  selectedProduct: string;
  selectedColor: string;
}

export const CanvasControls = ({ 
  currentSide, 
  onSideChange, 
  isAuthModalOpen, 
  isCartModalOpen, 
  selectedProduct, 
  selectedColor 
}: CanvasControlsProps) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState(false);

  // Hide controls when auth modal or cart modal is open
  if (isAuthModalOpen || isCartModalOpen) return null;

  const getDesignData = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return null;
    
    return {
      canvasData: canvas.toJSON(),
      currentSide,
      objects: canvas.getObjects().filter((obj: any) => obj.type !== 'image' || !obj.isBackground)
    };
  };

  const loadDesignData = (designData: any) => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas || !designData) return;

    // Clear current objects except background
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (!obj.isBackground) {
        canvas.remove(obj);
      }
    });

    // Load the saved design
    if (designData.canvasData) {
      canvas.loadFromJSON(designData.canvasData, () => {
        canvas.renderAll();
      });
    }
  };

  const generatePreviewImage = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return undefined;
    return canvas.toDataURL({ format: 'png', quality: 0.8 });
  };
  
  return (
    <>
      {/* Undo/Redo Controls - positioned on the left, stacked vertically */}
      <div className="absolute top-4 left-4 z-[100]">
        <div className="flex flex-col gap-2">
          <UndoRedoControls />
        </div>
      </div>

      {/* Save/Load Controls - positioned on the top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100]">
        <div className="flex gap-2 bg-background/95 backdrop-blur-sm shadow-sm rounded-md border border-border p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          
          <Sheet open={isLoadPanelOpen} onOpenChange={setIsLoadPanelOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Load
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Load Design</SheetTitle>
              </SheetHeader>
              <SavedDesignsPanel 
                onLoadDesign={loadDesignData}
                onClose={() => setIsLoadPanelOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Front/Back Toggle - positioned on the right, stacked vertically */}
      <div className="absolute top-4 right-4 z-[100]">
        <div className="flex flex-col gap-1 bg-background/95 backdrop-blur-sm shadow-sm rounded-md border border-border p-1">
          <Button
            variant={currentSide === "front" ? "default" : "ghost"}
            size="sm"
            onClick={() => onSideChange("front")}
            className="w-full"
          >
            Front
          </Button>
          
          {/* Embossed divider line */}
          <div className="relative mx-1 my-0.5">
            <div className="h-0.5 bg-border/30 border-t border-border/60 border-b border-background/60 shadow-inner"></div>
          </div>
          
          <Button
            variant={currentSide === "back" ? "default" : "ghost"}
            size="sm"
            onClick={() => onSideChange("back")}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </div>

      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        designData={getDesignData()}
        productType={selectedProduct}
        productColor={selectedColor}
        previewImage={generatePreviewImage()}
      />
    </>
  );
};