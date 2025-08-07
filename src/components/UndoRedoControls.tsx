import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";
import { useState, useEffect } from "react";


export const UndoRedoControls = () => {

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDesignCanvasReady, setIsDesignCanvasReady] = useState(false);
  const updateUndoRedoState = () => {
    const designCanvas = (window as any).designCanvas;
    if (designCanvas && designCanvas.canUndo && designCanvas.canRedo) {
      if (!isDesignCanvasReady) {
        setIsDesignCanvasReady(true);
        console.log('[UndoRedoControls] DesignCanvas is now ready!');
      }
      const undoState = designCanvas.canUndo();
      const redoState = designCanvas.canRedo();
      setCanUndo(undoState);
      setCanRedo(redoState);
    }
  };

  // Poll for undo/redo state changes and wait for designCanvas to be ready
  useEffect(() => {
    const interval = setInterval(updateUndoRedoState, 100);
    return () => clearInterval(interval);
  }, [isDesignCanvasReady]);

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
          <Undo className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
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
          <Redo className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
        </Button>
        <span className="text-[10px] md:text-xs text-muted-foreground">Redo</span>
      </div>
    </div>
  );
};