import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={() => {
              console.log('[UI] Undo button clicked');
              const designCanvas = (window as any).designCanvas;
              console.log('[UI] Design canvas available:', !!designCanvas);
              if (designCanvas) {
                console.log('[UI] Calling undo function');
                designCanvas.undo();
                updateUndoRedoState();
              } else {
                console.log('[UI] ERROR: Design canvas not available');
              }
            }}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Undo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={() => {
              console.log('[UI] Redo button clicked');
              const designCanvas = (window as any).designCanvas;
              console.log('[UI] Design canvas available:', !!designCanvas);
              if (designCanvas) {
                console.log('[UI] Calling redo function');
                designCanvas.redo();
                updateUndoRedoState();
              } else {
                console.log('[UI] ERROR: Design canvas not available');
              }
            }}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};