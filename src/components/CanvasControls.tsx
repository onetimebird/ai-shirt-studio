import { Button } from "@/components/ui/button";
import { UndoRedoControls } from "@/components/UndoRedoControls";

interface CanvasControlsProps {
  currentSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  isAuthModalOpen?: boolean;
  isCartModalOpen?: boolean;
  isSaveModalOpen?: boolean;
  isLoadPanelOpen?: boolean;
  isShareModalOpen?: boolean;
}

export const CanvasControls = ({ 
  currentSide, 
  onSideChange, 
  isAuthModalOpen, 
  isCartModalOpen,
  isSaveModalOpen,
  isLoadPanelOpen,
  isShareModalOpen
}: CanvasControlsProps) => {
  // Hide controls when any modal or panel is open
  if (isAuthModalOpen || isCartModalOpen || isSaveModalOpen || isLoadPanelOpen || isShareModalOpen) return null;
  
  return (
    <>
      {/* Undo/Redo Controls - positioned on the left, smaller on mobile */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-[100]">
        <div className="flex flex-col gap-2">
          <UndoRedoControls />
        </div>
      </div>
      
      {/* Front/Back Toggle - positioned on the right, smaller on mobile */}
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-[100]">
        <div className="flex flex-col gap-1 bg-background/95 backdrop-blur-sm shadow-sm rounded-md border border-border p-1">
          <Button
            variant={currentSide === "front" ? "default" : "ghost"}
            size="sm"
            onClick={() => onSideChange("front")}
            className="w-full text-xs md:text-sm h-5 md:h-8 px-1.5 md:px-3"
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
            className="w-full text-xs md:text-sm h-5 md:h-8 px-1.5 md:px-3"
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};