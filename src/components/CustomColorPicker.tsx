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
  "#6495ed", "#dc143c", "#00008b", "#008b8b", "#b8860b", "#a9a9a9"
];

// Convert HSV to RGB
const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

// Convert RGB to Hex
const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

export const CustomColorPicker = ({ value, onChange, className = "" }: CustomColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [lightness, setLightness] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Draw color spectrum
    const canvas = canvasRef.current;
    const hueCanvas = hueRef.current;
    if (canvas && hueCanvas) {
      const ctx = canvas.getContext('2d');
      const hueCtx = hueCanvas.getContext('2d');
      
      if (ctx && hueCtx) {
        // Draw main color area
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const s = x / width;
            const v = 1 - (y / height);
            const [r, g, b] = hsvToRgb(hue, s, v);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }

        // Draw hue bar
        const hueWidth = hueCanvas.width;
        const hueHeight = hueCanvas.height;
        
        for (let x = 0; x < hueWidth; x++) {
          const h = (x / hueWidth) * 360;
          const [r, g, b] = hsvToRgb(h, 1, 1);
          hueCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          hueCtx.fillRect(x, 0, 1, hueHeight);
        }
      }
    }
  }, [hue]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const s = x / canvas.width;
      const v = 1 - (y / canvas.height);
      
      setSaturation(s);
      setLightness(v);
      
      const [r, g, b] = hsvToRgb(hue, s, v);
      const hex = rgbToHex(r, g, b);
      onChange(hex);
    }
  };

  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const h = (x / canvas.width) * 360;
      setHue(h);
      
      const [r, g, b] = hsvToRgb(h, saturation, lightness);
      const hex = rgbToHex(r, g, b);
      onChange(hex);
    }
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
          className={`w-10 h-8 p-0 border rounded ${className}`}
          style={{ backgroundColor: value }}
          title="Click to select color"
        >
          <span className="sr-only">Color picker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          {/* Full Color Picker */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Color Picker</label>
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="border cursor-crosshair"
                onClick={handleCanvasClick}
              />
              <canvas
                ref={hueRef}
                width={256}
                height={20}
                className="border cursor-pointer"
                onClick={handleHueClick}
              />
            </div>
          </div>

          {/* Preset Colors */}
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
          
          {/* Hex Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Hex Color</label>
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};