import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CustomColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00",
  "#ff00ff", "#00ffff", "#ffa500", "#800080", "#008000", "#ff69b4",
  "#ffc0cb", "#a52a2a", "#808080", "#000080", "#008080", "#800000",
  "#ff6347", "#40e0d0", "#ee82ee", "#90ee90", "#ffb6c1", "#dda0dd",
  "#87ceeb", "#deb887", "#5f9ea0", "#7fff00", "#d2691e", "#ff7f50",
  "#6495ed", "#dc143c", "#00008b", "#008b8b", "#b8860b", "#a9a9a9"
];

export const CustomColorPicker = ({ value, onChange, className = "" }: CustomColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleHexInput = (hexValue: string) => {
    // Allow typing # and hex characters
    if (hexValue.startsWith('#') && /^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
      if (hexValue.length === 7) {
        onChange(hexValue.toUpperCase());
      }
    } else if (!hexValue.startsWith('#') && /^[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
      const fullHex = '#' + hexValue;
      if (fullHex.length === 7) {
        onChange(fullHex.toUpperCase());
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-10 h-8 p-0 border rounded ${className}`}
          style={{ backgroundColor: value }}
          title="Click to select color"
        >
          <span className="sr-only">Color picker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preset Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Hex Color</label>
            <div className="flex gap-2 items-center">
              <div 
                className="w-12 h-8 border rounded flex-shrink-0"
                style={{ backgroundColor: value }}
                title={`Current color: ${value}`}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleHexInput(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter hex color (e.g., #FF0000 for red)</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};