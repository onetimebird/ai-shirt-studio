import { useState, useRef, useEffect } from "react";
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
  "#6495ed", "#dc143c", "#00008b", "#008b8b", "#b8860b", "#a9a9a9",
  "#2f4f4f", "#556b2f", "#8b4513", "#483d8b", "#b22222", "#228b22",
  "#4682b4", "#d2b48c", "#cd853f", "#daa520", "#b8860b", "#20b2aa",
  "#f0e68c", "#98fb98", "#afeeee", "#db7093", "#ffefd5", "#ffdab9"
];

// Convert HSL to RGB
const hslToRgb = (h: number, s: number, l: number) => {
  h = h / 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

// Convert RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
};

export const CustomColorPicker = ({ value, onChange, className = "" }: CustomColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [lightness, setLightness] = useState(0.5);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);

  // Initialize HSL values from current color
  useEffect(() => {
    if (value && value !== "#000000") {
      const hex = value.replace('#', '');
      if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const [h, s, l] = rgbToHsl(r, g, b);
        setHue(h);
        setSaturation(s);
        setLightness(l);
      }
    }
  }, []);

  const handleColorAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!colorAreaRef.current) return;
    
    const rect = colorAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newSaturation = Math.max(0, Math.min(1, x / rect.width));
    const newLightness = Math.max(0, Math.min(1, 1 - (y / rect.height)));
    
    setSaturation(newSaturation);
    setLightness(newLightness);
    
    const [r, g, b] = hslToRgb(hue, newSaturation, newLightness);
    const hex = rgbToHex(r, g, b);
    onChange(hex);
  };

  const handleHueBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hueBarRef.current) return;
    
    const rect = hueBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    
    setHue(newHue);
    
    const [r, g, b] = hslToRgb(newHue, saturation, lightness);
    const hex = rgbToHex(r, g, b);
    onChange(hex);
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleHexInput = (hexValue: string) => {
    if (hexValue.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      onChange(hexValue.toUpperCase());
    } else if (!hexValue.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(hexValue)) {
      onChange('#' + hexValue.toUpperCase());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-10 h-8 p-0 border-border rounded-md shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 ${className}`}
          style={{ backgroundColor: value }}
          title="Click to select color"
        >
          <span className="sr-only">Color picker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-6 bg-card border-border shadow-lg">
        <div className="space-y-6">
          {/* Custom Color Picker */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Custom Color Picker</label>
            <div className="space-y-3">
              {/* Color Area */}
              <div
                ref={colorAreaRef}
                className="w-64 h-64 border-border border rounded-lg cursor-crosshair shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
                style={{
                  background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`
                }}
                onClick={handleColorAreaClick}
              >
                <div className="absolute inset-0 rounded-lg pointer-events-none bg-gradient-to-br from-transparent via-transparent to-background/5"></div>
                {/* Current color indicator */}
                <div
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
                  style={{
                    left: `${saturation * 100}%`,
                    top: `${(1 - lightness) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              </div>
              
              {/* Hue Bar */}
              <div
                ref={hueBarRef}
                className="w-64 h-5 border-border border rounded-md cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
                onClick={handleHueBarClick}
              >
                <div className="absolute inset-0 rounded-md pointer-events-none bg-gradient-to-r from-transparent via-transparent to-background/5"></div>
                {/* Hue indicator */}
                <div
                  className="absolute w-1 h-full bg-white border border-gray-400 shadow-md pointer-events-none"
                  style={{
                    left: `${(hue / 360) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preset Colors */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Preset Colors</label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-md border border-border cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-primary/20 shimmer-hover"
                  style={{ backgroundColor: color }}
                  onClick={() => handlePresetClick(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Hex Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground block">Hex Color</label>
            <div className="flex gap-3 items-center">
              <div 
                className="w-12 h-8 border border-border rounded-md flex-shrink-0 shadow-sm"
                style={{ backgroundColor: value }}
                title={`Current color: ${value}`}
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleHexInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};