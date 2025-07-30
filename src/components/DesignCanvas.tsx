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
  console.log('[DesignCanvas] Component rendering');
  
  // State for undo/redo functionality
  const canvasHistory = {
    states: [] as string[],
    currentIndex: -1,
    isRestoring: false  // Flag to prevent history saves during undo/redo
  };
  
  return (
    <ProductCanvas 
      selectedColor={selectedColor}
      currentSide={currentSide}
      selectedProduct={selectedProduct}
      onCanvasReady={(canvas) => {
        console.log('[DesignCanvas] onCanvasReady callback triggered');
        console.log("Canvas ready, setting up global designCanvas object");
        console.log("Canvas details:", { width: canvas.width, height: canvas.height });
        
        // Initialize history with user objects only (excluding product template)
        const saveUserObjectsState = () => {
          const allObjects = canvas.getObjects();
          // Filter out the product template image - it's usually the first object or has specific properties
          const userObjects = allObjects.filter(obj => {
            // Skip objects that are part of the product template
            // Template objects typically have selectable: false or evented: false
            return obj.selectable !== false && obj.evented !== false;
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
          
          console.log('[History] Saved state:', {
            totalStates: canvasHistory.states.length,
            currentIndex: canvasHistory.currentIndex,
            userObjectsCount: userObjects.length
          });
        };
        
        // Save initial empty state (no user objects)
        console.log('[History] Initializing history system');
        saveUserObjectsState();
        console.log('[History] Initial state saved');
        
        // Save state after any user object modification
        const setupHistoryListeners = () => {
          console.log('[History] Setting up event listeners');
          canvas.on('object:added', (e) => {
            const obj = e.target;
            // Only save state for user-added objects AND when not restoring from history
            if (obj && obj.selectable !== false && obj.evented !== false && !canvasHistory.isRestoring) {
              console.log('[History] Object added, saving state:', obj.type);
              setTimeout(saveUserObjectsState, 100);
            } else if (canvasHistory.isRestoring) {
              console.log('[History] Object added during restore, skipping save');
            }
          });
          canvas.on('object:removed', (e) => {
            const obj = e.target;
            if (obj && obj.selectable !== false && obj.evented !== false && !canvasHistory.isRestoring) {
              console.log('[History] Object removed, saving state:', obj.type);
              setTimeout(saveUserObjectsState, 100);
            } else if (canvasHistory.isRestoring) {
              console.log('[History] Object removed during restore, skipping save');
            }
          });
          canvas.on('object:modified', (e) => {
            const obj = e.target;
            if (obj && obj.selectable !== false && obj.evented !== false && !canvasHistory.isRestoring) {
              console.log('[History] Object modified, saving state:', obj.type);
              setTimeout(saveUserObjectsState, 100);
            } else if (canvasHistory.isRestoring) {
              console.log('[History] Object modified during restore, skipping save');
            }
          });
        };
        
        console.log('[History] Calling setupHistoryListeners');
        setupHistoryListeners();
        console.log('[History] Event listeners set up complete');
        console.log('[History] Setting up global designCanvas object');
        
        // Make canvas available globally for design tools
        (window as any).designCanvas = { 
          canvas,
          history: canvasHistory,  // Add reference to history object
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
            console.log('[Undo] Attempting undo. Current state:', {
              currentIndex: canvasHistory.currentIndex,
              totalStates: canvasHistory.states.length,
              canUndo: canvasHistory.currentIndex > 0
            });
            
            if (canvasHistory.currentIndex > 0) {
              console.log('[Undo] Setting isRestoring to true');
              canvasHistory.isRestoring = true;
              
              canvasHistory.currentIndex--;
              const previousState = canvasHistory.states[canvasHistory.currentIndex];
              const userObjectsData = JSON.parse(previousState);
              
              console.log('[Undo] Restoring state:', {
                newIndex: canvasHistory.currentIndex,
                objectsToRestore: userObjectsData.length
              });
              
              // Get all current objects
              const allObjects = canvas.getObjects();
              
              // Remove only user objects (preserve product template)
              const objectsToRemove = allObjects.filter(obj => {
                return obj.selectable !== false && obj.evented !== false;
              });
              
              console.log('[Undo] Removing', objectsToRemove.length, 'user objects');
              objectsToRemove.forEach(obj => canvas.remove(obj));
              
              // Restore user objects from history
              if (userObjectsData.length > 0) {
                util.enlivenObjects(userObjectsData).then((objects: any[]) => {
                  objects.forEach(obj => canvas.add(obj));
                  canvas.renderAll();
                  console.log('[Undo] Successfully restored', objects.length, 'user objects');
                  canvasHistory.isRestoring = false;
                  console.log('[Undo] Setting isRestoring to false');
                });
              } else {
                canvas.renderAll();
                console.log('[Undo] No objects to restore');
                canvasHistory.isRestoring = false;
                console.log('[Undo] Setting isRestoring to false');
              }
              
              onSelectedObjectChange(null);
            } else {
              console.log('[Undo] Cannot undo - at beginning of history');
            }
          },
          redo: () => {
            console.log('[Redo] Attempting redo. Current state:', {
              currentIndex: canvasHistory.currentIndex,
              totalStates: canvasHistory.states.length,
              canRedo: canvasHistory.currentIndex < canvasHistory.states.length - 1
            });
            
            if (canvasHistory.currentIndex < canvasHistory.states.length - 1) {
              console.log('[Redo] Setting isRestoring to true');
              canvasHistory.isRestoring = true;
              
              canvasHistory.currentIndex++;
              const nextState = canvasHistory.states[canvasHistory.currentIndex];
              const userObjectsData = JSON.parse(nextState);
              
              console.log('[Redo] Restoring state:', {
                newIndex: canvasHistory.currentIndex,
                objectsToRestore: userObjectsData.length
              });
              
              // Get all current objects
              const allObjects = canvas.getObjects();
              
              // Remove only user objects (preserve product template)
              const objectsToRemove = allObjects.filter(obj => {
                return obj.selectable !== false && obj.evented !== false;
              });
              
              console.log('[Redo] Removing', objectsToRemove.length, 'user objects');
              objectsToRemove.forEach(obj => canvas.remove(obj));
              
              // Restore user objects from history
              if (userObjectsData.length > 0) {
                util.enlivenObjects(userObjectsData).then((objects: any[]) => {
                  objects.forEach(obj => canvas.add(obj));
                  canvas.renderAll();
                  console.log('[Redo] Successfully restored', objects.length, 'user objects');
                  canvasHistory.isRestoring = false;
                  console.log('[Redo] Setting isRestoring to false');
                });
              } else {
                canvas.renderAll();
                console.log('[Redo] No objects to restore');
                canvasHistory.isRestoring = false;
                console.log('[Redo] Setting isRestoring to false');
              }
              
              onSelectedObjectChange(null);
            } else {
              console.log('[Redo] Cannot redo - at end of history');
            }
          },
          canUndo: () => canvasHistory.currentIndex > 0,
          canRedo: () => canvasHistory.currentIndex < canvasHistory.states.length - 1
        };
        
        console.log('[History] Global designCanvas object created with functions:', {
          hasUndo: typeof (window as any).designCanvas.undo === 'function',
          hasRedo: typeof (window as any).designCanvas.redo === 'function',
          hasCanUndo: typeof (window as any).designCanvas.canUndo === 'function',
          hasCanRedo: typeof (window as any).designCanvas.canRedo === 'function'
        });
        
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

        // Enable double-click to edit text
        canvas.on('mouse:dblclick', (e: any) => {
          const target = e.target;
          if (target && (target.type === 'textbox' || target.type === 'text')) {
            target.enterEditing();
            canvas.setActiveObject(target);
            canvas.renderAll();
          }
        });

        // Keyboard handlers - but only when NOT editing text
        const handleKeyDown = (e: KeyboardEvent) => {
          const activeObject = canvas.getActiveObject();
          
          // Don't interfere with text editing - check if we're in text editing mode
          if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
            // Check if the text object is in editing mode
            if ((activeObject as any).isEditing) {
              console.log('Text is being edited, ignoring keyboard shortcuts');
              return; // Don't handle delete/backspace when editing text content
            }
          }
          
          if (e.key === 'Delete' || e.key === 'Backspace') {
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