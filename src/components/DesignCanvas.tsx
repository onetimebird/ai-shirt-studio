import { ProductCanvas } from "@/components/ProductCanvas";
import { FabricImage } from "fabric";

interface DesignCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  activeTool: string;
  onSelectedObjectChange: (object: any) => void;
  onToolChange: (tool: string) => void;
}

export const DesignCanvas = ({
  selectedColor,
  currentSide,
  activeTool,
  onSelectedObjectChange,
  onToolChange,
}: DesignCanvasProps) => {
  return (
    <ProductCanvas 
      selectedColor={selectedColor}
      currentSide={currentSide}
      onCanvasReady={(canvas) => {
        // Make canvas available globally for design tools
        (window as any).designCanvas = { 
          canvas,
          addImage: (file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              FabricImage.fromURL(result, {
                crossOrigin: "anonymous",
              }).then((img) => {
                img.scale(0.5);
                img.set({
                  left: 100,
                  top: 100,
                });
                canvas.add(img);
                canvas.renderAll();
              });
            };
            reader.readAsDataURL(file);
          },
          textObjects: []
        };

        // Handle object selection
        canvas.on('selection:created', (e: any) => {
          onSelectedObjectChange(e.selected?.[0] || null);
        });

        canvas.on('selection:updated', (e: any) => {
          onSelectedObjectChange(e.selected?.[0] || null);
        });

        canvas.on('selection:cleared', () => {
          onSelectedObjectChange(null);
        });

        // Keyboard handlers
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              canvas.remove(activeObject);
              canvas.renderAll();
              onSelectedObjectChange(null);
            }
          }

          if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              activeObject.clone().then((cloned: any) => {
                cloned.set({
                  left: (activeObject.left || 0) + 20,
                  top: (activeObject.top || 0) + 20,
                });
                canvas.add(cloned);
                canvas.setActiveObject(cloned);
                canvas.renderAll();
              });
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }}
    />
  );
};