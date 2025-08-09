import React, { useState, useRef, useEffect } from 'react';

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

const LayersDropdown = ({ selectedObject, canvas, onBringToFront, onSendToBack, onBringForward, onSendBackward }: LayersDropdownProps) => {
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
      {/* Layer Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 bg-white border-2 border-[#8138ff] rounded-full shadow-md hover:shadow-lg flex items-center justify-center
        transition-all duration-200 hover:bg-[#8138ff] hover:text-white text-[#8138ff]"
        title="Layer Options"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <rect x="9" y="9" width="6" height="6" rx="1" ry="1"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg 
        py-1 z-[10000] min-w-[140px]">
          <button
            onClick={() => handleLayerAction('bring-to-front')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="9" y="9" width="6" height="6" rx="1" ry="1"/>
            </svg>
            Bring to Front
          </button>

          <button
            onClick={() => handleLayerAction('bring-forward')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="7,2 17,2 21,6 21,20 7,20 3,16 3,2"/>
              <polygon points="7,6 17,6 21,10"/>
            </svg>
            Bring Forward
          </button>

          <button
            onClick={() => handleLayerAction('send-backward')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="17,22 7,22 3,18 3,4 17,4 21,8 21,22"/>
              <polygon points="17,18 7,18 3,14"/>
            </svg>
            Send Backward
          </button>

          <button
            onClick={() => handleLayerAction('send-to-back')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="9" y="9" width="6" height="6" rx="1" ry="1" fill="currentColor"/>
            </svg>
            Send to Back
          </button>
        </div>
      )}
    </div>
  );
};

export default LayersDropdown;