import { useEffect, useState, useRef } from 'react';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import './ObjectOverlayControls.css';

interface ObjectOverlayControlsProps {
  canvas: FabricCanvas | null;
  selectedObject: FabricObject | null;
}

interface ControlPosition {
  x: number;
  y: number;
  visible: boolean;
}

export const ObjectOverlayControls = ({ canvas, selectedObject }: ObjectOverlayControlsProps) => {
  const [controlPositions, setControlPositions] = useState<{
    delete: ControlPosition;
    rotate: ControlPosition;
    scale: ControlPosition;
    layers: ControlPosition;
    stretchH: ControlPosition;
    stretchV: ControlPosition;
  }>({
    delete: { x: 0, y: 0, visible: false },
    rotate: { x: 0, y: 0, visible: false },
    scale: { x: 0, y: 0, visible: false },
    layers: { x: 0, y: 0, visible: false },
    stretchH: { x: 0, y: 0, visible: false },
    stretchV: { x: 0, y: 0, visible: false },
  });

  const controlsRef = useRef<HTMLDivElement>(null);

  // Update control positions when object selection changes or transforms
  useEffect(() => {
    if (!canvas || !selectedObject || !controlsRef.current) {
      setControlPositions(prev => ({
        ...prev,
        delete: { ...prev.delete, visible: false },
        rotate: { ...prev.rotate, visible: false },
        scale: { ...prev.scale, visible: false },
        layers: { ...prev.layers, visible: false },
        stretchH: { ...prev.stretchH, visible: false },
        stretchV: { ...prev.stretchV, visible: false },
      }));
      return;
    }

    const updatePositions = () => {
      const canvasElement = canvas.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();
      const objectBounds = selectedObject.getBoundingRect();
      
      // Calculate zoom and viewport transform
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform!;
      
      // Transform object bounds to screen coordinates
      const left = canvasRect.left + (objectBounds.left + vpt[4]) * zoom;
      const top = canvasRect.top + (objectBounds.top + vpt[5]) * zoom;
      const width = objectBounds.width * zoom;
      const height = objectBounds.height * zoom;
      
      const offset = 16; // Distance from object edge
      
      setControlPositions({
        delete: { 
          x: left - offset, 
          y: top - offset, 
          visible: true 
        },
        rotate: { 
          x: left + width + offset, 
          y: top - offset, 
          visible: true 
        },
        scale: { 
          x: left + width + offset, 
          y: top + height + offset, 
          visible: true 
        },
        layers: { 
          x: left - offset, 
          y: top + height + offset, 
          visible: true 
        },
        stretchH: { 
          x: left + width + offset, 
          y: top + height / 2, 
          visible: true 
        },
        stretchV: { 
          x: left + width / 2, 
          y: top + height + offset, 
          visible: true 
        },
      });
    };

    updatePositions();

    // Listen for object transformations and canvas changes
    const events = ['object:moving', 'object:scaling', 'object:rotating', 'object:modified', 'canvas:viewportTransform'];
    events.forEach(event => canvas.on(event, updatePositions));

    // Also update on window resize/scroll
    const handleWindowEvent = () => setTimeout(updatePositions, 10);
    window.addEventListener('resize', handleWindowEvent);
    window.addEventListener('scroll', handleWindowEvent);

    return () => {
      events.forEach(event => canvas.off(event, updatePositions));
      window.removeEventListener('resize', handleWindowEvent);
      window.removeEventListener('scroll', handleWindowEvent);
    };
  }, [canvas, selectedObject]);

  // Control handlers
  const handleDelete = () => {
    if (canvas && selectedObject) {
      canvas.remove(selectedObject);
      canvas.requestRenderAll();
      canvas.discardActiveObject();
    }
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Enable rotation by temporarily showing rotate control
      selectedObject.set({
        hasRotatingPoint: true,
      });
      canvas.requestRenderAll();
    }
  };

  const handleScale = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Start scaling interaction - enable corner controls temporarily
      const startScaling = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const startX = pointer.x;
        const startY = pointer.y;
        const originalScaleX = selectedObject.scaleX || 1;
        const originalScaleY = selectedObject.scaleY || 1;

        const doScale = (moveEvent: MouseEvent) => {
          const movePointer = canvas.getPointer(moveEvent);
          const deltaX = movePointer.x - startX;
          const deltaY = movePointer.y - startY;
          const scale = Math.max(0.1, 1 + (deltaX + deltaY) / 100);
          
          selectedObject.set({
            scaleX: originalScaleX * scale,
            scaleY: originalScaleY * scale,
          });
          canvas.requestRenderAll();
        };

        const endScale = () => {
          document.removeEventListener('mousemove', doScale);
          document.removeEventListener('mouseup', endScale);
          canvas.fire('object:modified', { target: selectedObject });
        };

        document.addEventListener('mousemove', doScale);
        document.addEventListener('mouseup', endScale);
      };

      startScaling(e.nativeEvent);
    }
  };

  const handleLayers = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Simple layer controls - bring to front or send to back
      const currentIndex = canvas.getObjects().indexOf(selectedObject);
      if (currentIndex < canvas.getObjects().length - 1) {
        canvas.bringToFront(selectedObject);
      } else {
        canvas.sendToBack(selectedObject);
      }
      canvas.requestRenderAll();
    }
  };

  const handleStretchH = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Start horizontal stretching
      const startStretch = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const startX = pointer.x;
        const originalScaleX = selectedObject.scaleX || 1;

        const doStretch = (moveEvent: MouseEvent) => {
          const movePointer = canvas.getPointer(moveEvent);
          const deltaX = movePointer.x - startX;
          const scale = Math.max(0.1, 1 + deltaX / 100);
          
          selectedObject.set({
            scaleX: originalScaleX * scale,
          });
          canvas.requestRenderAll();
        };

        const endStretch = () => {
          document.removeEventListener('mousemove', doStretch);
          document.removeEventListener('mouseup', endStretch);
          canvas.fire('object:modified', { target: selectedObject });
        };

        document.addEventListener('mousemove', doStretch);
        document.addEventListener('mouseup', endStretch);
      };

      startStretch(e.nativeEvent);
    }
  };

  const handleStretchV = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Start vertical stretching
      const startStretch = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const startY = pointer.y;
        const originalScaleY = selectedObject.scaleY || 1;

        const doStretch = (moveEvent: MouseEvent) => {
          const movePointer = canvas.getPointer(moveEvent);
          const deltaY = movePointer.y - startY;
          const scale = Math.max(0.1, 1 + deltaY / 100);
          
          selectedObject.set({
            scaleY: originalScaleY * scale,
          });
          canvas.requestRenderAll();
        };

        const endStretch = () => {
          document.removeEventListener('mousemove', doStretch);
          document.removeEventListener('mouseup', endStretch);
          canvas.fire('object:modified', { target: selectedObject });
        };

        document.addEventListener('mousemove', doStretch);
        document.addEventListener('mouseup', endStretch);
      };

      startStretch(e.nativeEvent);
    }
  };

  if (!selectedObject) return null;

  return (
    <div ref={controlsRef} className="object-overlay-controls">
      {/* Delete Control - Top Left */}
      {controlPositions.delete.visible && (
        <div 
          className="overlay-control overlay-control-delete"
          style={{
            left: controlPositions.delete.x - 12, // Center the 24px control
            top: controlPositions.delete.y - 12,
          }}
          onClick={handleDelete}
          title="Delete"
        >
          <img src="/src/assets/icons/TrashCan.svg" width="16" height="16" alt="Delete" />
        </div>
      )}

      {/* Rotate Control - Top Right */}
      {controlPositions.rotate.visible && (
        <div 
          className="overlay-control overlay-control-rotate"
          style={{
            left: controlPositions.rotate.x - 12,
            top: controlPositions.rotate.y - 12,
          }}
          onMouseDown={handleRotate}
          title="Rotate"
        >
          <img src="/src/assets/icons/RotateIcon.svg" width="16" height="16" alt="Rotate" />
        </div>
      )}

      {/* Scale Control - Bottom Right */}
      {controlPositions.scale.visible && (
        <div 
          className="overlay-control overlay-control-scale"
          style={{
            left: controlPositions.scale.x - 12,
            top: controlPositions.scale.y - 12,
          }}
          onMouseDown={handleScale}
          title="Resize"
        >
          <img src="/src/assets/icons/ScaleIcon.svg" width="16" height="16" alt="Scale" />
        </div>
      )}

      {/* Layers Control - Bottom Left */}
      {controlPositions.layers.visible && (
        <div 
          className="overlay-control overlay-control-layers"
          style={{
            left: controlPositions.layers.x - 12,
            top: controlPositions.layers.y - 12,
          }}
          onClick={handleLayers}
          title="Layer Order"
        >
          <img src="/src/assets/icons/LayersIcon.svg" width="16" height="16" alt="Layers" />
        </div>
      )}

      {/* Horizontal Stretch Control - Middle Right */}
      {controlPositions.stretchH.visible && (
        <div 
          className="overlay-control overlay-control-stretch-h"
          style={{
            left: controlPositions.stretchH.x - 12,
            top: controlPositions.stretchH.y - 12,
          }}
          onMouseDown={handleStretchH}
          title="Change Width"
        >
          <img src="/src/assets/icons/StretchHorizontal.svg" width="16" height="16" alt="Stretch Horizontal" />
        </div>
      )}

      {/* Vertical Stretch Control - Middle Bottom */}
      {controlPositions.stretchV.visible && (
        <div 
          className="overlay-control overlay-control-stretch-v"
          style={{
            left: controlPositions.stretchV.x - 12,
            top: controlPositions.stretchV.y - 12,
          }}
          onMouseDown={handleStretchV}
          title="Change Height"
        >
          <img src="/src/assets/icons/StrechVertical.svg" width="16" height="16" alt="Stretch Vertical" />
        </div>
      )}
    </div>
  );
};