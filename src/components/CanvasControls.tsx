import { Button } from "@/components/ui/button";
import { UndoRedoControls } from "@/components/UndoRedoControls";

interface CanvasControlsProps {
  currentSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
  isAuthModalOpen?: boolean;
  isCartModalOpen?: boolean;
  isSaveModalOpen?: boolean;
}

export const CanvasControls = ({ 
  currentSide, 
  onSideChange, 
  isAuthModalOpen, 
  isCartModalOpen,
  isSaveModalOpen
}: CanvasControlsProps) => {
  // Hide controls when auth modal, cart modal, or save modal is open
  if (isAuthModalOpen || isCartModalOpen || isSaveModalOpen) return null;
  
  return (
    <>
      {/* Undo/Redo Controls - positioned on the left, stacked vertically */}
      <div className="absolute top-4 left-4 z-[100]">
        <div className="flex flex-col gap-2">
          <UndoRedoControls />
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
    </>
  );
};