import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";
import { useState, useEffect } from "react";


export const UndoRedoControls = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoState = () => {
    const designCanvas = (window as any).designCanvas;
    if (designCanvas && designCanvas.canUndo && designCanvas.canRedo) {
      setCanUndo(designCanvas.canUndo());
      setCanRedo(designCanvas.canRedo());
    }
  };

  // Check state periodically only until canvas is ready
  useEffect(() => {
    const checkCanvas = () => {
      const designCanvas = (window as any).designCanvas;
      if (designCanvas && designCanvas.canUndo && designCanvas.canRedo) {
        updateUndoRedoState();
        return true; // Canvas is ready
      }
      return false; // Canvas not ready yet
    };

    const interval = setInterval(() => {
      if (checkCanvas()) {
        clearInterval(interval);
      }
    }, 1000); // Check every second instead of every 100ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-0.5 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg w-10 md:w-16">
      <div className="relative group flex flex-col items-center py-0.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onTouchStart={(e) => {
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.undo) {
              designCanvas.undo();
              updateUndoRedoState();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.undo) {
              designCanvas.undo();
              updateUndoRedoState();
            }
          }}
          className="h-3 w-4 md:h-6 md:w-6 p-0 touch-manipulation select-none"
        >
          <img src="/icons/undo.svg" className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 dark:filter dark:brightness-0 dark:invert" alt="Undo" />
        </Button>
        <span className="text-[10px] md:text-xs text-muted-foreground">Undo</span>
      </div>

      {/* Embossed divider line */}
      <div className="relative mx-1 my-0.5">
        <div className="h-0.5 bg-border/30 border-t border-border/60 border-b border-background/60 shadow-inner"></div>
      </div>

      <div className="relative group flex flex-col items-center py-0.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canRedo}
          onTouchStart={(e) => {
            e.preventDefault();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.redo) {
              designCanvas.redo();
              updateUndoRedoState();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.redo) {
              designCanvas.redo();
              updateUndoRedoState();
            }
          }}
          className="h-3 w-4 md:h-6 md:w-6 p-0 touch-manipulation select-none"
        >
          <img src="/icons/redo.svg" className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 dark:filter dark:brightness-0 dark:invert" alt="Redo" />
        </Button>
        <span className="text-[10px] md:text-xs text-muted-foreground">Redo</span>
      </div>
    </div>
  );
};