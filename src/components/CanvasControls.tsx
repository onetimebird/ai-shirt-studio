import { Button } from "@/components/ui/button";
import { UndoRedoControls } from "@/components/UndoRedoControls";

interface CanvasControlsProps {
  currentSide: "front" | "back";
  onSideChange: (side: "front" | "back") => void;
}

export const CanvasControls = ({ currentSide, onSideChange }: CanvasControlsProps) => {
  return (
    <>
      {/* Undo/Redo Controls - positioned on the left */}
      <div className="absolute top-4 left-4 z-[60]">
        <UndoRedoControls />
      </div>
      
      {/* Front/Back Toggle - positioned on the right */}
      <div className="absolute top-4 right-4 z-[60]">
        <div className="flex items-center border border-border rounded-md bg-background/95 backdrop-blur-sm shadow-sm">
          <Button
            variant={currentSide === "front" ? "default" : "ghost"}
            size="sm"
            onClick={() => onSideChange("front")}
            className="rounded-r-none"
          >
            Front
          </Button>
          <Button
            variant={currentSide === "back" ? "default" : "ghost"}
            size="sm"
            onClick={() => onSideChange("back")}
            className="rounded-l-none border-l"
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};