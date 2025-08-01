import { Button } from "@/components/ui/button";
import { Undo, Redo } from "lucide-react";
import { useState, useEffect } from "react";

export const UndoRedoControls = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isDesignCanvasReady, setIsDesignCanvasReady] = useState(false);

  // Update undo/redo state
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
    <div className="absolute top-4 left-4 z-[110] flex items-center gap-1.5 md:gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-1.5 md:p-2 shadow-lg">
      <div className="relative group flex flex-col items-center">
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
          className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted active:bg-muted/80 touch-manipulation select-none"
        >
          <Undo className="w-2.5 h-2.5 md:w-3 md:h-3" />
        </Button>
        {/* Mobile label */}
        <span className="block md:hidden text-[7px] text-muted-foreground leading-none">Undo</span>
        {/* Desktop label */}
        <span className="hidden md:block text-[10px] text-muted-foreground leading-none mt-1">Undo</span>
        {/* Desktop tooltip */}
        <div className="hidden md:block absolute left-10 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
          Undo (Ctrl+Z)
        </div>
      </div>

      <div className="relative group flex flex-col items-center">
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
          className="h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-muted active:bg-muted/80 touch-manipulation select-none"
        >
          <Redo className="w-2.5 h-2.5 md:w-3 md:h-3" />
        </Button>
        {/* Mobile label */}
        <span className="block md:hidden text-[7px] text-muted-foreground leading-none">Redo</span>
        {/* Desktop label */}
        <span className="hidden md:block text-[10px] text-muted-foreground leading-none mt-1">Redo</span>
        {/* Desktop tooltip */}
        <div className="hidden md:block absolute left-10 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
          Redo (Ctrl+Y)
        </div>
      </div>
    </div>
  );
};