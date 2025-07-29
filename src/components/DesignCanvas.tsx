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
        console.log("Canvas ready, setting up global designCanvas object");
        // Make canvas available globally for design tools
        (window as any).designCanvas = { 
          canvas,
          addImage: (file: File) => {
            console.log("addImage called with file:", file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              FabricImage.fromURL(result, {
                crossOrigin: "anonymous",
              }).then((img) => {
              // Scale and position for mobile/desktop
              const canvasWidth = canvas.width || 600;
              const canvasHeight = canvas.height || 700;
              const isMobile = canvasWidth < 400;
              
              img.scale(isMobile ? 0.3 : 0.5);
              img.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
              });
                canvas.add(img);
                canvas.renderAll();
                console.log("Image added to canvas successfully");
              }).catch((error) => {
                console.error("Error adding image:", error);
              });
            };
            reader.readAsDataURL(file);
          },
          addImageFromUrl: (url: string) => {
            console.log("addImageFromUrl called with url:", url);
            FabricImage.fromURL(url, {
              crossOrigin: "anonymous",
            }).then((img) => {
              // Scale and position for mobile/desktop
              const canvasWidth = canvas.width || 600;
              const canvasHeight = canvas.height || 700;
              const isMobile = canvasWidth < 400;
              
              img.scale(isMobile ? 0.3 : 0.5);
              img.set({
                left: canvasWidth / 2,
                top: canvasHeight / 2,
                originX: 'center',
                originY: 'center',
              });
              canvas.add(img);
              canvas.renderAll();
              console.log("Image from URL added to canvas successfully");
            }).catch((error) => {
              console.error("Error adding image from URL:", error);
            });
          },
          deleteSelected: () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              canvas.remove(activeObject);
              canvas.renderAll();
            }
          },
          duplicateSelected: () => {
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
          },
          rotateSelected: () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              activeObject.rotate((activeObject.angle || 0) + 45);
              canvas.renderAll();
            }
          },
          centerSelected: () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              activeObject.set({
                left: (canvas.width || 0) / 2,
                top: (canvas.height || 0) / 2,
              });
              canvas.renderAll();
            }
          },
          clearSelection: () => {
            canvas.discardActiveObject();
            canvas.renderAll();
          },
          updateSelectedTextProperty: (property: string, value: any) => {
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
              (activeObject as any).set(property, value);
              canvas.renderAll();
            }
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