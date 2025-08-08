import { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
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
      
      // Get object's actual transform properties
      const objLeft = selectedObject.left || 0;
      const objTop = selectedObject.top || 0;
      const objWidth = selectedObject.width || 0;
      const objHeight = selectedObject.height || 0;
      const objScaleX = selectedObject.scaleX || 1;
      const objScaleY = selectedObject.scaleY || 1;
      const objAngle = selectedObject.angle || 0;
      
      // Calculate actual display dimensions
      const scaledWidth = objWidth * objScaleX;
      const scaledHeight = objHeight * objScaleY;
      
      // Use Fabric.js coordinate transformation with zoom and viewport
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform!;
      
      // Transform object center to screen coordinates
      const centerX = canvasRect.left + (objLeft * zoom + vpt[4]);
      const centerY = canvasRect.top + (objTop * zoom + vpt[5]);
      
      // Calculate rotated corner positions
      const angleRad = (objAngle * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      
      const halfWidth = (scaledWidth * zoom) / 2;
      const halfHeight = (scaledHeight * zoom) / 2;
      
      // Calculate the four corners of the rotated bounding box
      const corners = [
        { x: -halfWidth, y: -halfHeight }, // top-left
        { x: halfWidth, y: -halfHeight },  // top-right  
        { x: halfWidth, y: halfHeight },   // bottom-right
        { x: -halfWidth, y: halfHeight }   // bottom-left
      ];
      
      // Rotate corners around center
      const rotatedCorners = corners.map(corner => ({
        x: centerX + (corner.x * cos - corner.y * sin),
        y: centerY + (corner.x * sin + corner.y * cos)
      }));
      
      const offset = 2; // Tighter to bounding box
      
      // Position controls relative to rotated corners
      const [topLeft, topRight, bottomRight, bottomLeft] = rotatedCorners;
      
      setControlPositions({
        delete: { 
          x: topLeft.x - offset, 
          y: topLeft.y - offset, 
          visible: true 
        },
        rotate: { 
          x: topRight.x + offset, 
          y: topRight.y - offset, 
          visible: true 
        },
        layers: { 
          x: bottomLeft.x - offset, 
          y: bottomLeft.y + offset, 
          visible: true 
        },
        stretchH: { 
          x: topRight.x + offset, 
          y: (topRight.y + bottomRight.y) / 2, 
          visible: true 
        },
        scale: { 
          x: bottomRight.x + offset, 
          y: bottomRight.y + offset, 
          visible: true 
        },
        stretchV: { 
          x: (bottomLeft.x + bottomRight.x) / 2, 
          y: bottomLeft.y + offset, 
          visible: true 
        },
      });
    };

    updatePositions();

    // Use flushSync for immediate DOM updates during transforms
    const immediateUpdate = () => {
      // Force immediate DOM update instead of batched React update
      flushSync(() => {
        updatePositions();
      });
    };

    // Listen to both canvas events and object-specific events
    const canvasEvents = [
      'object:moving',
      'object:scaling', 
      'object:rotating',
      'object:transforming', // This fires during active transforms
      'object:modified',
      'canvas:viewportTransform'
    ];

    // Add event listeners
    canvasEvents.forEach(event => {
      canvas.on(event, (e) => {
        // Only update if it's our selected object
        if (e.target === selectedObject || event === 'canvas:viewportTransform') {
          immediateUpdate();
        }
      });
    });

    // Also listen directly to the selected object's events
    selectedObject.on('moving', immediateUpdate);
    selectedObject.on('scaling', immediateUpdate);
    selectedObject.on('rotating', immediateUpdate);
    selectedObject.on('modified', immediateUpdate);

    // Window events
    const handleWindowEvent = () => updatePositions();
    window.addEventListener('resize', handleWindowEvent);
    window.addEventListener('scroll', handleWindowEvent);

    return () => {
      // Clean up canvas event listeners
      canvasEvents.forEach(event => {
        canvas.off(event);
      });
      
      // Clean up object-specific event listeners
      if (selectedObject) {
        selectedObject.off('moving');
        selectedObject.off('scaling');
        selectedObject.off('rotating');
        selectedObject.off('modified');
      }
      
      // Clean up window event listeners
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
      // Ultra-smooth scaling with requestAnimationFrame
      let animationFrame: number | null = null;
      
      const startScaling = (event: MouseEvent) => {
        const pointer = canvas.getPointer(event);
        const center = selectedObject.getCenterPoint();
        const startDistance = Math.sqrt(
          Math.pow(pointer.x - center.x, 2) + Math.pow(pointer.y - center.y, 2)
        );
        const originalScaleX = selectedObject.scaleX || 1;
        const originalScaleY = selectedObject.scaleY || 1;

        const doScale = (moveEvent: MouseEvent) => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
          
          animationFrame = requestAnimationFrame(() => {
            const movePointer = canvas.getPointer(moveEvent);
            const currentDistance = Math.sqrt(
              Math.pow(movePointer.x - center.x, 2) + Math.pow(movePointer.y - center.y, 2)
            );
            
            // Smoother scaling with easing
            let scaleFactor = currentDistance / startDistance;
            scaleFactor = Math.max(0.1, Math.min(5, scaleFactor)); // Reasonable limits
            
            selectedObject.set({
              scaleX: originalScaleX * scaleFactor,
              scaleY: originalScaleY * scaleFactor,
            });
            
            canvas.requestRenderAll();
            animationFrame = null;
          });
        };

        const endScale = () => {
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
          }
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
            left: controlPositions.delete.x - 10, // Center the 20px control
            top: controlPositions.delete.y - 10,
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
            left: controlPositions.rotate.x - 10,
            top: controlPositions.rotate.y - 10,
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
            left: controlPositions.scale.x - 10,
            top: controlPositions.scale.y - 10,
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
            left: controlPositions.layers.x - 10,
            top: controlPositions.layers.y - 10,
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
            left: controlPositions.stretchH.x - 10, // Center tighter rectangular control (20px)
            top: controlPositions.stretchH.y - 8,   // Center tighter rectangular control (16px)
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
            left: controlPositions.stretchV.x - 8,   // Center tighter rectangular control (16px)
            top: controlPositions.stretchV.y - 10,   // Center tighter rectangular control (20px)
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