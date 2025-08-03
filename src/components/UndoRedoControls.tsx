import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";
import { useState, useEffect } from "react";

// CRITICAL TEST: This component IS loading (we see its logs) 
console.log('🔥 UndoRedoControls.tsx loaded - CONFIRMING MAIN.TSX ISSUE');

export const UndoRedoControls = () => {

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDesignCanvasReady, setIsDesignCanvasReady] = useState(false);
  const updateUndoRedoState = () => {
    const designCanvas = (window as any).designCanvas;
    console.log('[UndoRedoControls] Checking undo/redo state, designCanvas exists:', !!designCanvas);
    if (designCanvas && designCanvas.canUndo && designCanvas.canRedo) {
      if (!isDesignCanvasReady) {
        setIsDesignCanvasReady(true);
        console.log('[UndoRedoControls] DesignCanvas is now ready!');
      }
      const undoState = designCanvas.canUndo();
      const redoState = designCanvas.canRedo();
      console.log('[UndoRedoControls] undo:', undoState, 'redo:', redoState);
      setCanUndo(undoState);
      setCanRedo(redoState);
    } else {
      console.log('[UndoRedoControls] DesignCanvas not ready yet');
    }
  };

  // Poll for undo/redo state changes and wait for designCanvas to be ready
  useEffect(() => {
    const interval = setInterval(updateUndoRedoState, 100);
    return () => clearInterval(interval);
  }, [isDesignCanvasReady]);

  return (
    <div className="flex flex-col gap-0.5 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg w-16">
      <div className="relative group flex flex-col items-center py-0.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onTouchStart={(e) => {
            e.preventDefault();
            console.log('[UndoRedoControls] Undo button touched (mobile)');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            console.log('[UndoRedoControls] Undo button touch end');
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.undo) {
              console.log('[UndoRedoControls] Calling undo function from touch');
              designCanvas.undo();
              updateUndoRedoState();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            console.log('[UndoRedoControls] Undo button clicked');
            const designCanvas = (window as any).designCanvas;
            console.log('[UndoRedoControls] Design canvas available:', !!designCanvas);
            if (designCanvas && designCanvas.undo) {
              console.log('[UndoRedoControls] Calling undo function');
              designCanvas.undo();
              updateUndoRedoState();
            } else {
              console.log('[UndoRedoControls] ERROR: Design canvas or undo function not available');
            }
          }}
          className="h-6 w-6 p-0 bg-background hover:bg-primary/10 hover:border-primary/20 border border-transparent active:bg-muted/80 touch-manipulation select-none transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Undo className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground">Undo</span>
      </div>

      {/* Subtle divider line */}
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
            console.log('[UndoRedoControls] Redo button touched (mobile)');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            console.log('[UndoRedoControls] Redo button touch end');
            const designCanvas = (window as any).designCanvas;
            if (designCanvas && designCanvas.redo) {
              console.log('[UndoRedoControls] Calling redo function from touch');
              designCanvas.redo();
              updateUndoRedoState();
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            console.log('[UndoRedoControls] Redo button clicked');
            const designCanvas = (window as any).designCanvas;
            console.log('[UndoRedoControls] Design canvas available:', !!designCanvas);
            if (designCanvas && designCanvas.redo) {
              console.log('[UndoRedoControls] Calling redo function');
              designCanvas.redo();
              updateUndoRedoState();
            } else {
              console.log('[UndoRedoControls] ERROR: Design canvas or redo function not available');
            }
          }}
          className="h-6 w-6 p-0 bg-background hover:bg-primary/10 hover:border-primary/20 border border-transparent active:bg-muted/80 touch-manipulation select-none transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-0.5"
        >
          <Redo className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground">Redo</span>
      </div>
    </div>
  );
};