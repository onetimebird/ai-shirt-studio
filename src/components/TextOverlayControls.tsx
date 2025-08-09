import React from 'react';
import { Trash2, RotateCw, Move, Copy, ArrowLeftRight, Maximize2, ChevronsUpDown, Layers } from 'lucide-react';
import LayersDropdown from './LayersDropdown';
import './TextOverlayControls.css';

interface TextOverlayProps {
  onDelete: () => void;
  onVerticalScaleStart: (e: React.PointerEvent) => void;
  onRotateStart: (e: React.PointerEvent) => void;
  onStretchStart: (e: React.PointerEvent) => void;
  onScaleStart: (e: React.PointerEvent) => void;
  onDuplicate: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  bounds: { x: number; y: number; width: number; height: number };
}

export const TextOverlayControls: React.FC<TextOverlayProps> = ({
  onDelete,
  onVerticalScaleStart,
  onRotateStart,
  onStretchStart,
  onScaleStart,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  bounds,
}) => {
  const { x, y, width, height } = bounds;

  return (
    <div className="overlay-container" style={{ left: x, top: y, width, height }}>
      {/* Delete - Top Left */}
      <button
        className="overlay-btn top-left"
        onClick={onDelete}
        title="Delete"
      >
        <Trash2 size={14} />
      </button>

      {/* Vertical Scale (Font Height) - Top Center */}
      <div
        className="overlay-handle top-center"
        onPointerDown={onVerticalScaleStart}
        title="Scale Font Height"
      >
        <ChevronsUpDown size={14} />
      </div>

      {/* Rotate - Top Right */}
      <div
        className="overlay-handle top-right"
        onPointerDown={onRotateStart}
        title="Rotate"
      >
        <RotateCw size={14} />
      </div>

      {/* Horizontal Stretch - Mid Right */}
      <div
        className="overlay-handle mid-right"
        onPointerDown={onStretchStart}
        title="Stretch"
      >
        <ArrowLeftRight size={14} />
      </div>

      {/* Scale Uniformly - Bottom Right */}
      <div
        className="overlay-handle bottom-right"
        onPointerDown={onScaleStart}
        title="Scale"
      >
        <Maximize2 size={14} />
      </div>

      {/* Duplicate - Bottom Center */}
      <button
        className="overlay-btn bottom-center"
        onClick={onDuplicate}
        title="Duplicate"
      >
        <Copy size={14} />
      </button>

      {/* Layers Dropdown - Bottom Left - DEBUG VERSION */}
      <div 
        style={{ 
          position: 'absolute',
          bottom: '-18px',
          left: '-18px',
          pointerEvents: 'auto',
          zIndex: 10000,
          backgroundColor: 'red', // DEBUG: Make it visible
          width: '40px',
          height: '40px',
          border: '3px solid yellow' // DEBUG: Make it very obvious
        }}
      >
        <LayersDropdown
          onBringToFront={() => {
            console.log('onBringToFront called');
            onBringToFront?.();
          }}
          onSendToBack={() => {
            console.log('onSendToBack called');
            onSendToBack?.();
          }}
          onBringForward={() => {
            console.log('onBringForward called');
            onBringForward?.();
          }}
          onSendBackward={() => {
            console.log('onSendBackward called');
            onSendBackward?.();
          }}
        />
      </div>
    </div>
  );
}