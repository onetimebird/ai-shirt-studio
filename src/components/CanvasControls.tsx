import { Button } from "@/components/ui/button";
import { UndoRedoControls } from "@/components/UndoRedoControls";

interface CanvasControlsProps {
  currentSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
}

export const CanvasControls = ({ currentSide, onSideChange }: CanvasControlsProps) => {
  return (
    <>
      {/* Undo/Redo Controls - positioned on the left, stacked vertically */}
      <div className="absolute top-4 left-4 z-[60]">
        <div className="flex flex-col gap-2">
          <UndoRedoControls />
        </div>
      </div>
      
      {/* Front/Back Toggle - positioned on the right, stacked vertically */}
      <div className="absolute top-4 right-4 z-[60]">
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
          <div className="relative mx-4 my-2">
            <div className="h-0.5 bg-border/30 shadow-[0_1px_0_0_hsl(var(--background))]"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-border/60"></div>
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