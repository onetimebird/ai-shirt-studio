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
    <div className="absolute top-4 left-4 z-[100] flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg pointer-events-auto">
      {/* Test button to verify clicks work */}
      <Button
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log('[TEST] Test button clicked - buttons are working!');
          alert('Test button works!');
        }}
        className="h-8 w-8 p-0 mr-2"
      >
        T
      </Button>
      <div className="relative group flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canUndo}
          onClick={() => {
            console.log('[UndoRedoControls] Undo button clicked');
            const designCanvas = (window as any).designCanvas;
            console.log('[UndoRedoControls] Design canvas available:', !!designCanvas);
            console.log('[UndoRedoControls] Design canvas object:', designCanvas);
            if (designCanvas && designCanvas.undo) {
              console.log('[UndoRedoControls] Calling undo function');
              designCanvas.undo();
              updateUndoRedoState();
            } else {
              console.log('[UndoRedoControls] ERROR: Design canvas or undo function not available');
              console.log('[UndoRedoControls] Available functions:', Object.keys(designCanvas || {}));
            }
          }}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Undo className="w-3 h-3" />
        </Button>
        {/* Mobile label */}
        <span className="block md:hidden text-[8px] text-muted-foreground leading-none">Undo</span>
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
          onClick={() => {
            console.log('[UndoRedoControls] Redo button clicked');
            const designCanvas = (window as any).designCanvas;
            console.log('[UndoRedoControls] Design canvas available:', !!designCanvas);
            console.log('[UndoRedoControls] Design canvas object:', designCanvas);
            if (designCanvas && designCanvas.redo) {
              console.log('[UndoRedoControls] Calling redo function');
              designCanvas.redo();
              updateUndoRedoState();
            } else {
              console.log('[UndoRedoControls] ERROR: Design canvas or redo function not available');
              console.log('[UndoRedoControls] Available functions:', Object.keys(designCanvas || {}));
            }
          }}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Redo className="w-3 h-3" />
        </Button>
        {/* Mobile label */}
        <span className="block md:hidden text-[8px] text-muted-foreground leading-none">Redo</span>
        {/* Desktop tooltip */}
        <div className="hidden md:block absolute left-10 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
          Redo (Ctrl+Y)
        </div>
      </div>
    </div>
  );
};