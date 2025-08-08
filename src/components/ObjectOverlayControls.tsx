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
        scale: { 
          x: left + width + offset, 
          y: top + height + offset, 
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
      // Start rotation interaction
      const startRotation = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const center = selectedObject.getCenterPoint();
        let startAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
        const originalAngle = selectedObject.angle || 0;

        const doRotate = (moveEvent: MouseEvent) => {
          const movePointer = canvas.getPointer(moveEvent);
          const currentAngle = Math.atan2(movePointer.y - center.y, movePointer.x - center.x);
          const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
          
          selectedObject.set({
            angle: originalAngle + angleDiff,
          });
          canvas.requestRenderAll();
        };

        const endRotate = () => {
          document.removeEventListener('mousemove', doRotate);
          document.removeEventListener('mouseup', endRotate);
          canvas.fire('object:modified', { target: selectedObject });
        };

        document.addEventListener('mousemove', doRotate);
        document.addEventListener('mouseup', endRotate);
      };

      startRotation(e.nativeEvent);
    }
  };

  const handleScale = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvas && selectedObject) {
      // Start uniform scaling interaction
      const startScaling = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const center = selectedObject.getCenterPoint();
        const startDistance = Math.sqrt(
          Math.pow(pointer.x - center.x, 2) + Math.pow(pointer.y - center.y, 2)
        );
        const originalScaleX = selectedObject.scaleX || 1;
        const originalScaleY = selectedObject.scaleY || 1;

        const doScale = (moveEvent: MouseEvent) => {
          const movePointer = canvas.getPointer(moveEvent);
          const currentDistance = Math.sqrt(
            Math.pow(movePointer.x - center.x, 2) + Math.pow(movePointer.y - center.y, 2)
          );
          const scaleFactor = Math.max(0.1, currentDistance / startDistance);
          
          selectedObject.set({
            scaleX: originalScaleX * scaleFactor,
            scaleY: originalScaleY * scaleFactor,
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
          const deltaX = (movePointer.x - startX) / 50; // Adjust sensitivity
          const scaleFactor = Math.max(0.1, 1 + deltaX);
          
          selectedObject.set({
            scaleX: originalScaleX * scaleFactor,
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
          const deltaY = (movePointer.y - startY) / 50; // Adjust sensitivity
          const scaleFactor = Math.max(0.1, 1 + deltaY);
          
          selectedObject.set({
            scaleY: originalScaleY * scaleFactor,
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 16.47 15.1" fill="currentColor">
            <path d="M14.3,2.17A8,8,0,0,1,3.09,13.42,7.84,7.84,0,0,1,1.68,12,8,8,0,0,1,2.31,1.48L3.73,2.89a6,6,0,0,0-.62,7.69,6.63,6.63,0,0,0,.65.77,5.73,5.73,0,0,0,.76.64A6,6,0,0,0,12.87,3.6L10.08,6.39,10,1.45,10,0h6.46Z"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="9 0 11.79 2.79 8.59 6 10 7.41 13.21 4.21 16 7 16 0 9 0"/>
            <polygon points="6 8.59 2.79 11.79 0 9 0 16 7 16 4.21 13.21 7.41 10 6 8.59"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 16 8" fill="currentColor">
            <polygon points="0 4 3 1 3 3 13 3 13 1 16 4 13 7 13 5 3 5 3 7"/>
          </svg>
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
          <svg width="16" height="16" viewBox="0 0 8 16" fill="currentColor">
            <polygon points="4 0 1 3 3 3 3 13 1 13 4 16 7 13 5 13 5 3 7 3"/>
          </svg>
        </div>
      )}
    </div>
  );
};