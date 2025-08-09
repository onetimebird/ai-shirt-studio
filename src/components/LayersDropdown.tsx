import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// Import proper layer icons
import frontIcon from "@/assets/icons/front.svg";
import backIcon from "@/assets/icons/back.svg";
import layerForwardIcon from "@/assets/icons/layer-forward.svg";
import layerBackwardIcon from "@/assets/icons/layer-backward.svg";

interface LayersDropdownProps {
  selectedObject?: any;
  canvas?: any;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
}

const LayersDropdown = ({ selectedObject, canvas, onBringToFront, onSendToBack, onBringForward, onSendBackward, trigger }: LayersDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLayerAction = (action: string) => {
    if (!canvas || !selectedObject) {
      // Fallback to prop functions if canvas/selectedObject not available
      switch (action) {
        case 'bring-to-front':
          onBringToFront?.();
          break;
        case 'send-to-back':
          onSendToBack?.();
          break;
        case 'bring-forward':
          onBringForward?.();
          break;
        case 'send-backward':
          onSendBackward?.();
          break;
      }
      setIsOpen(false);
      return;
    }

    switch (action) {
      case 'bring-to-front':
        if (canvas.bringObjectToFront) canvas.bringObjectToFront(selectedObject);
        else if (canvas.bringToFront) canvas.bringToFront(selectedObject);
        break;
      case 'send-to-back':
        if (canvas.sendObjectToBack) canvas.sendObjectToBack(selectedObject);
        else if (canvas.sendToBack) canvas.sendToBack(selectedObject);
        break;
      case 'bring-forward':
        if (canvas.bringObjectForward) canvas.bringObjectForward(selectedObject);
        else if (canvas.bringForward) canvas.bringForward(selectedObject);
        break;
      case 'send-backward':
        if (canvas.sendObjectBackwards) canvas.sendObjectBackwards(selectedObject);
        else if (canvas.sendBackward) canvas.sendBackward(selectedObject);
        break;
    }

    canvas.renderAll();
    setIsOpen(false); // Close dropdown after action
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => {
          console.log('LayersDropdown button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('LayersDropdown button clicked, current isOpen:', isOpen);
            setIsOpen(!isOpen);
          }}
        >
          <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Layers
        </Button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-[10000] min-w-[150px]">
          <button
            onClick={() => handleLayerAction('bring-to-front')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 flex items-center gap-3 transition-colors duration-200"
          >
            <img src={frontIcon} alt="" className="w-4 h-4" />
            Bring to Front
          </button>

          <button
            onClick={() => handleLayerAction('bring-forward')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 flex items-center gap-3 transition-colors duration-200"
          >
            <img src={layerForwardIcon} alt="" className="w-4 h-4" />
            Bring Forward
          </button>

          <button
            onClick={() => handleLayerAction('send-backward')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 flex items-center gap-3 transition-colors duration-200 whitespace-nowrap"
          >
            <img src={layerBackwardIcon} alt="" className="w-4 h-4" />
            Send Backward
          </button>

          <button
            onClick={() => handleLayerAction('send-to-back')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/20 flex items-center gap-3 transition-colors duration-200"
          >
            <img src={backIcon} alt="" className="w-4 h-4" />
            Send to Back
          </button>
        </div>
      )}
    </div>
  );
};

export default LayersDropdown;