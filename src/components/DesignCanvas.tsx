import { ProductCanvas } from "@/components/ProductCanvas";
import { FabricImage, util } from "fabric";

interface DesignCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  selectedProduct: string;
  activeTool: string;
  onSelectedObjectChange: (object: any) => void;
  onToolChange: (tool: string) => void;
  onTextObjectsUpdate?: (objects: any[]) => void;
  onImageObjectsUpdate?: (objects: any[]) => void;
}

export const DesignCanvas = ({
  selectedColor,
  currentSide,
  selectedProduct,
  activeTool,
  onSelectedObjectChange,
  onToolChange,
  onTextObjectsUpdate,
  onImageObjectsUpdate
}: DesignCanvasProps) => {
  // State for undo/redo functionality
  const canvasHistory = {
    states: [] as string[],
    currentIndex: -1
  };
  return (
    <ProductCanvas 
      selectedColor={selectedColor}
      currentSide={currentSide}
      selectedProduct={selectedProduct}
      onCanvasReady={(canvas) => {
        console.log("Canvas ready, setting up global designCanvas object");
        console.log("Canvas details:", { width: canvas.width, height: canvas.height });
        
        // Initialize history with user objects only (excluding product template)
        const saveUserObjectsState = () => {
          const allObjects = canvas.getObjects();
          // Filter out the product template image - it's usually the first object or has specific properties
          const userObjects = allObjects.filter(obj => {
            // Skip objects that are part of the product template
            return obj.selectable !== false && 
                   !obj.evented === false && 
                   obj.type !== 'group' || 
                   (obj.type === 'group' && obj.selectable !== false);
          });
          
          const userObjectsData = userObjects.map(obj => obj.toObject());
          const currentState = JSON.stringify(userObjectsData);
          
          // Remove any states after current index (when user did undo and then new action)
          canvasHistory.states = canvasHistory.states.slice(0, canvasHistory.currentIndex + 1);
          canvasHistory.states.push(currentState);
          canvasHistory.currentIndex = canvasHistory.states.length - 1;
          
          // Limit history to 20 states to prevent memory issues
          if (canvasHistory.states.length > 20) {
            canvasHistory.states.shift();
            canvasHistory.currentIndex--;
          }
          
          console.log('Saved canvas state with', userObjects.length, 'user objects');
        };
        
        // Save initial empty state (no user objects)
        saveUserObjectsState();
        
        // Save state after any user object modification
        const setupHistoryListeners = () => {
          canvas.on('object:added', (e) => {
            const obj = e.target;
            // Only save state for user-added objects (not template objects)
            if (obj && obj.selectable !== false) {
              setTimeout(saveUserObjectsState, 100);
            }
          });
          canvas.on('object:removed', (e) => {
            const obj = e.target;
            if (obj && obj.selectable !== false) {
              setTimeout(saveUserObjectsState, 100);
            }
          });
          canvas.on('object:modified', (e) => {
            const obj = e.target;
            if (obj && obj.selectable !== false) {
              setTimeout(saveUserObjectsState, 100);
            }
          });
        };
        
        setupHistoryListeners();
        
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
                   canvas.bringObjectToFront(img); // Ensure image is on top
                   canvas.renderAll();
                   console.log("Image added to canvas successfully");
                   // Update image objects list
                   setTimeout(() => {
                     if ((window as any).designCanvas?.updateImageObjects) {
                       (window as any).designCanvas.updateImageObjects();
                     }
                   }, 100);
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
                canvas.bringObjectToFront(img); // Ensure image is on top
                canvas.renderAll();
               console.log("Image from URL added to canvas successfully");
               // Update image objects list
               setTimeout(() => {
                 if ((window as any).designCanvas?.updateImageObjects) {
                   (window as any).designCanvas.updateImageObjects();
                 }
               }, 100);
            }).catch((error) => {
              console.error("Error adding image from URL:", error);
            });
          },
          deleteSelected: () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
              canvas.remove(activeObject);
              canvas.renderAll();
              console.log('Object deleted, updating objects list');
              // Update both text and image objects list after a small delay to ensure canvas is updated
              setTimeout(() => {
                if ((window as any).designCanvas?.updateTextObjects) {
                  (window as any).designCanvas.updateTextObjects();
                }
                if ((window as any).designCanvas?.updateImageObjects) {
                  (window as any).designCanvas.updateImageObjects();
                }
              }, 100);
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
                // Update objects list based on type
                if (cloned.type === 'textbox' || cloned.type === 'text') {
                  if ((window as any).designCanvas?.updateTextObjects) {
                    (window as any).designCanvas.updateTextObjects();
                  }
                } else if (cloned.type === 'image') {
                  if ((window as any).designCanvas?.updateImageObjects) {
                    (window as any).designCanvas.updateImageObjects();
                  }
                }
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
            console.log(`Updating text property: ${property} = ${value}`);
            const activeObject = canvas.getActiveObject();
            if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
              console.log(`Found active text object, updating ${property}`);
              (activeObject as any).set(property, value);
              canvas.renderAll();
              console.log(`Property ${property} updated successfully`);
            } else {
              console.log(`No active text object found. Active object:`, activeObject);
            }
          },
          textObjects: [],
          updateTextObjects: () => {
            const allObjects = canvas.getObjects();
            const textObjs = allObjects.filter(obj => obj.type === 'textbox' || obj.type === 'text');
            (window as any).designCanvas.textObjects = textObjs;
            console.log('Updated text objects:', textObjs.length);
            // Notify parent component
            if (onTextObjectsUpdate) {
              onTextObjectsUpdate(textObjs);
            }
          },
          imageObjects: [],
          updateImageObjects: () => {
            const allObjects = canvas.getObjects();
            const imageObjs = allObjects.filter(obj => obj.type === 'image');
            (window as any).designCanvas.imageObjects = imageObjs;
            console.log('Updated image objects:', imageObjs.length);
            // Notify parent component
            if (onImageObjectsUpdate) {
              onImageObjectsUpdate(imageObjs);
            }
          },
          undo: () => {
            if (canvasHistory.currentIndex > 0) {
              canvasHistory.currentIndex--;
              const previousState = canvasHistory.states[canvasHistory.currentIndex];
              const userObjectsData = JSON.parse(previousState);
              
              // Get all current objects
              const allObjects = canvas.getObjects();
              
              // Remove only user objects (preserve product template)
              const objectsToRemove = allObjects.filter(obj => {
                return obj.selectable !== false && 
                       !obj.evented === false && 
                       obj.type !== 'group' || 
                       (obj.type === 'group' && obj.selectable !== false);
              });
              
              objectsToRemove.forEach(obj => canvas.remove(obj));
              
              // Restore user objects from history
              if (userObjectsData.length > 0) {
                util.enlivenObjects(userObjectsData).then((objects: any[]) => {
                  objects.forEach(obj => canvas.add(obj));
                  canvas.renderAll();
                  console.log('Undo completed, restored', objects.length, 'user objects');
                });
              } else {
                canvas.renderAll();
                console.log('Undo completed, no objects to restore');
              }
              
              onSelectedObjectChange(null);
            } else {
              console.log('Cannot undo - at beginning of history');
            }
          },
          redo: () => {
            if (canvasHistory.currentIndex < canvasHistory.states.length - 1) {
              canvasHistory.currentIndex++;
              const nextState = canvasHistory.states[canvasHistory.currentIndex];
              const userObjectsData = JSON.parse(nextState);
              
              // Get all current objects
              const allObjects = canvas.getObjects();
              
              // Remove only user objects (preserve product template)
              const objectsToRemove = allObjects.filter(obj => {
                return obj.selectable !== false && 
                       !obj.evented === false && 
                       obj.type !== 'group' || 
                       (obj.type === 'group' && obj.selectable !== false);
              });
              
              objectsToRemove.forEach(obj => canvas.remove(obj));
              
              // Restore user objects from history
              if (userObjectsData.length > 0) {
                util.enlivenObjects(userObjectsData).then((objects: any[]) => {
                  objects.forEach(obj => canvas.add(obj));
                  canvas.renderAll();
                  console.log('Redo completed, restored', objects.length, 'user objects');
                });
              } else {
                canvas.renderAll();
                console.log('Redo completed, no objects to restore');
              }
              
              onSelectedObjectChange(null);
            } else {
              console.log('Cannot redo - at end of history');
            }
          },
          canUndo: () => canvasHistory.currentIndex > 0,
          canRedo: () => canvasHistory.currentIndex < canvasHistory.states.length - 1
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
              console.log('Object deleted via keyboard, updating objects list');
              // Update both text and image objects list after a small delay
              setTimeout(() => {
                if ((window as any).designCanvas?.updateTextObjects) {
                  (window as any).designCanvas.updateTextObjects();
                }
                if ((window as any).designCanvas?.updateImageObjects) {
                  (window as any).designCanvas.updateImageObjects();
                }
              }, 100);
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
                // Update objects list based on type
                if (cloned.type === 'textbox' || cloned.type === 'text') {
                  if ((window as any).designCanvas?.updateTextObjects) {
                    (window as any).designCanvas.updateTextObjects();
                  }
                } else if (cloned.type === 'image') {
                  if ((window as any).designCanvas?.updateImageObjects) {
                    (window as any).designCanvas.updateImageObjects();
                  }
                }
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