import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";
import { useState, useEffect } from "react";

export const UndoRedoControls = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Update undo/redo state
  const updateUndoRedoState = () => {
    const designCanvas = (window as any).designCanvas;
    if (designCanvas) {
      setCanUndo(designCanvas.canUndo());
      setCanRedo(designCanvas.canRedo());
    }
  };

  // Poll for undo/redo state changes
  useEffect(() => {
    const interval = setInterval(updateUndoRedoState, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg">
      <Button
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={() => {
          const designCanvas = (window as any).designCanvas;
          if (designCanvas) {
            designCanvas.undo();
            updateUndoRedoState();
          }
        }}
        className="h-8 w-8 p-0 hover:bg-muted"
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={!canRedo}
        onClick={() => {
          const designCanvas = (window as any).designCanvas;
          if (designCanvas) {
            designCanvas.redo();
            updateUndoRedoState();
          }
        }}
        className="h-8 w-8 p-0 hover:bg-muted"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};