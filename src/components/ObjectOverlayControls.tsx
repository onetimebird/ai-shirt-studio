import { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import './ObjectOverlayControls.css';

interface ObjectOverlayControlsProps {
  canvas: FabricCanvas | null;
  selectedObject: FabricObject | null;
}


export const ObjectOverlayControls = ({ canvas, selectedObject }: ObjectOverlayControlsProps) => {

  const controlsRef = useRef<HTMLDivElement>(null);


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

  // Use Fabric.js getBoundingRect() to get the actual screen position of the rotated object
  const canvasElement = canvas.getElement();
  const canvasRect = canvasElement.getBoundingClientRect();
  const zoom = canvas.getZoom();
  const vpt = canvas.viewportTransform!;
  
  // Get the bounding rect which gives us the actual bounds after rotation/scaling
  const objectBounds = selectedObject.getBoundingRect();
  
  // Transform to screen coordinates
  const screenLeft = canvasRect.left + (objectBounds.left * zoom + vpt[4]);
  const screenTop = canvasRect.top + (objectBounds.top * zoom + vpt[5]);
  const screenWidth = objectBounds.width * zoom;
  const screenHeight = objectBounds.height * zoom;
  
  console.log('ObjectOverlayControls Debug:', {
    objectAngle: selectedObject.angle || 0,
    objectBounds,
    screenLeft, screenTop, screenWidth, screenHeight,
    canvasRect,
    zoom, vpt
  });
  
  return (
    <div 
      ref={controlsRef} 
      className="object-overlay-controls"
      style={{
        position: 'fixed',
        left: screenLeft,
        top: screenTop,
        width: screenWidth,
        height: screenHeight,
        pointerEvents: 'none',
        zIndex: 1000,
        border: '2px solid red', // Debug border
        backgroundColor: 'rgba(255, 0, 0, 0.1)' // Debug background
      }}
    >
      {/* Delete Control - Top Left */}
      <div 
        className="overlay-control overlay-control-delete"
        style={{
          position: 'absolute',
          left: -12, // Position relative to wrapper
          top: -12,
          pointerEvents: 'auto'
        }}
        onClick={handleDelete}
        title="Delete"
      >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </div>

      {/* Rotate Control - Top Right */}
      <div 
        className="overlay-control overlay-control-rotate"
        style={{
          position: 'absolute',
          right: -12, // Position relative to wrapper
          top: -12,
          pointerEvents: 'auto'
        }}
        onMouseDown={handleRotate}
        title="Rotate"
      >
          <svg width="16" height="16" viewBox="0 0 16.47 15.1" fill="currentColor">
            <path d="M14.3,2.17A8,8,0,0,1,3.09,13.42,7.84,7.84,0,0,1,1.68,12,8,8,0,0,1,2.31,1.48L3.73,2.89a6,6,0,0,0-.62,7.69,6.63,6.63,0,0,0,.65.77,5.73,5.73,0,0,0,.76.64A6,6,0,0,0,12.87,3.6L10.08,6.39,10,1.45,10,0h6.46Z"/>
          </svg>
        </div>

      {/* Scale Control - Bottom Right */}
      <div 
        className="overlay-control overlay-control-scale"
        style={{
          position: 'absolute',
          right: -12,
          bottom: -12,
          pointerEvents: 'auto'
        }}
        onMouseDown={handleScale}
        title="Resize"
      >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="9 0 11.79 2.79 8.59 6 10 7.41 13.21 4.21 16 7 16 0 9 0"/>
            <polygon points="6 8.59 2.79 11.79 0 9 0 16 7 16 4.21 13.21 7.41 10 6 8.59"/>
          </svg>
        </div>

      {/* Layers Control - Bottom Left */}
      <div 
        className="overlay-control overlay-control-layers"
        style={{
          position: 'absolute',
          left: -12,
          bottom: -12,
          pointerEvents: 'auto'
        }}
        onClick={handleLayers}
        title="Layer Order"
      >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"/>
          </svg>
        </div>

      {/* Horizontal Stretch Control - Middle Right */}
      <div 
        className="overlay-control overlay-control-stretch-h"
        style={{
          position: 'absolute',
          right: -12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'auto'
        }}
        onMouseDown={handleStretchH}
        title="Change Width"
      >
          <svg width="16" height="16" viewBox="0 0 16 8" fill="currentColor">
            <polygon points="0 4 3 1 3 3 13 3 13 1 16 4 13 7 13 5 3 5 3 7"/>
          </svg>
        </div>

      {/* Vertical Stretch Control - Middle Bottom */}
      <div 
        className="overlay-control overlay-control-stretch-v"
        style={{
          position: 'absolute',
          bottom: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto'
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