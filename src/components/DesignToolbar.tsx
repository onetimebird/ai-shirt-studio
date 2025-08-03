import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Type, Image as ImageIcon, Palette, Bold, Italic, Underline, AlignCenter, AlignLeft, AlignRight, RotateCw, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DesignToolbarProps {
  activeTab: "text" | "image" | "colors";
  setActiveTab: (tab: "text" | "image" | "colors") => void;
  onAddText: () => void;
  onImageUpload: (file: File) => void;
  selectedObject: any;
  onUpdateTextProperties: (properties: any) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onRotateSelected: () => void;
  newText: string;
  setNewText: (text: string) => void;
  fontSize: number[];
  setFontSize: (size: number[]) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  isBold: boolean;
  setIsBold: (bold: boolean) => void;
  isItalic: boolean;
  setIsItalic: (italic: boolean) => void;
  isUnderline: boolean;
  setIsUnderline: (underline: boolean) => void;
  textAlign: string;
  setTextAlign: (align: string) => void;
}

const FONTS = [
  // System Fonts
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Impact", value: "Impact" },
  
  // Essential T-Shirt Design Fonts
  { name: "Oswald", value: "Oswald" },
  { name: "Anton", value: "Anton" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Inter", value: "Inter" },
  
  // Collegiate & Athletic
  { name: "Graduate", value: "Graduate" },
  { name: "Alfa Slab One", value: "Alfa Slab One" },
  { name: "Black Ops One", value: "Black Ops One" },
  { name: "Staatliches", value: "Staatliches" },
  { name: "Squada One", value: "Squada One" },
  
  // Bold & Strong
  { name: "Russo One", value: "Russo One" },
  { name: "Righteous", value: "Righteous" },
  { name: "Archivo Black", value: "Archivo Black" },
  { name: "Fjalla One", value: "Fjalla One" },
  { name: "Fugaz One", value: "Fugaz One" },
  { name: "Titan One", value: "Titan One" },
  { name: "Bowlby One", value: "Bowlby One" },
  
  // Fun & Decorative
  { name: "Bangers", value: "Bangers" },
  { name: "Fredoka One", value: "Fredoka One" },
  { name: "Permanent Marker", value: "Permanent Marker" },
  { name: "Creepster", value: "Creepster" },
  { name: "Bungee", value: "Bungee" },
  { name: "Passion One", value: "Passion One" },
  { name: "Acme", value: "Acme" },
  
  // Script & Elegant
  { name: "Pacifico", value: "Pacifico" },
  { name: "Dancing Script", value: "Dancing Script" },
  { name: "Lobster", value: "Lobster" },
  { name: "Satisfy", value: "Satisfy" },
  { name: "Playfair Display", value: "Playfair Display" },
  
  // Modern & Tech
  { name: "Orbitron", value: "Orbitron" },
  { name: "Audiowide", value: "Audiowide" },
  { name: "Exo", value: "Exo" },
  { name: "Teko", value: "Teko" },
  
  // Clean & Professional
  { name: "Nunito", value: "Nunito" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Raleway", value: "Raleway" },
  { name: "Work Sans", value: "Work Sans" },
  { name: "Rubik", value: "Rubik" },
  { name: "Barlow", value: "Barlow" },
  { name: "Kanit", value: "Kanit" },
  { name: "Saira", value: "Saira" },
  { name: "Changa", value: "Changa" },
  { name: "Roboto Condensed", value: "Roboto Condensed" },
  
  // Serif & Classic
  { name: "Merriweather", value: "Merriweather" },
  { name: "PT Sans", value: "PT Sans" },
  { name: "Crimson Text", value: "Crimson Text" },
  { name: "Abril Fatface", value: "Abril Fatface" },
  
  // Rounded & Friendly
  { name: "Comfortaa", value: "Comfortaa" },
  { name: "Quicksand", value: "Quicksand" },
  { name: "Josefin Sans", value: "Josefin Sans" },
  { name: "Kalam", value: "Kalam" },
];

export const DesignToolbar = ({
  activeTab,
  setActiveTab,
  onAddText,
  onImageUpload,
  selectedObject,
  onUpdateTextProperties,
  onDeleteSelected,
  onDuplicateSelected,
  onRotateSelected,
  newText,
  setNewText,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  textColor,
  setTextColor,
  isBold,
  setIsBold,
  isItalic,
  setIsItalic,
  isUnderline,
  setIsUnderline,
  textAlign,
  setTextAlign,
}: DesignToolbarProps) => {
  const handleAddText = () => {
    console.log('[DesignToolbar] Adding text with font:', fontFamily);
    const fabricCanvas = (window as any).designCanvas?.canvas;
    
    if (!fabricCanvas) {
      console.log('[DesignToolbar] Canvas not ready');
      return;
    }

    // Import fabric classes and text controls
    import('fabric').then(({ IText, Textbox }) => {
      import('@/lib/fabricTextControls').then(({ applyCustomControlsToObject }) => {
        // Create text object with selected properties
        const textObject = new IText(newText || "New Text", {
          left: fabricCanvas.width! / 2,
          top: fabricCanvas.height! / 2,
          fontFamily: fontFamily,
          fontSize: fontSize[0] || 24,
          fill: textColor,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
          underline: isUnderline,
          textAlign: textAlign as any,
          originX: 'center',
          originY: 'center',
          editable: true,
          objectCaching: false,
        });

        console.log('[DesignToolbar] Created text with fontFamily:', textObject.fontFamily);
        
        fabricCanvas.add(textObject);
        fabricCanvas.bringObjectToFront(textObject);
        applyCustomControlsToObject(textObject);
        fabricCanvas.setActiveObject(textObject);
        fabricCanvas.renderAll();
        
        // Clear the input for next text
        setNewText("");
      });
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      (window as any).designCanvas?.handleImageUpload(file);
    }
  };

  const handleDeleteSelected = () => {
    (window as any).designCanvas?.deleteSelected();
  };

  const handleDuplicateSelected = () => {
    (window as any).designCanvas?.duplicateSelected();
  };

  const handleRotateSelected = () => {
    (window as any).designCanvas?.rotateSelected();
  };

  return (
    <div className="bg-card border-b border-border">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto">
        <Button
          variant={activeTab === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("text")}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Text</span>
        </Button>
        
        <Button
          variant={activeTab === "image" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("image")}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Image</span>
        </Button>

        {/* Element Actions */}
        {selectedObject && (
          <div className="flex items-center gap-1 ml-auto">
            <Button size="sm" variant="outline" onClick={handleDuplicateSelected}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleRotateSelected}>
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tool-specific Controls */}
      {activeTab === "text" && (
        <div className="p-4 space-y-4">
          {/* Add Text */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddText()}
                className="flex-1"
              />
              <Button onClick={handleAddText}>Add</Button>
            </div>

            {/* Font selection for new text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={fontFamily} onValueChange={(value) => {
                console.log('Font changed to:', value);
                setFontFamily(value);
              }}>
                <SelectTrigger className="touch-manipulation">
                  <SelectValue placeholder="Select Font" />
                </SelectTrigger>
                <SelectContent className="max-h-60" position="popper" sideOffset={5}>
                  {FONTS.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      className="touch-manipulation cursor-pointer"
                    >
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">Size:</span>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={72}
                  min={8}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{fontSize[0]}</span>
              </div>
            </div>
          </div>

          {/* Text Properties */}
          {selectedObject && selectedObject.type === 'text' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap">Size:</span>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={72}
                    min={8}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-8 text-right">{fontSize[0]}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={isBold ? "default" : "outline"}
                    onClick={() => setIsBold(!isBold)}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isItalic ? "default" : "outline"}
                    onClick={() => setIsItalic(!isItalic)}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={isUnderline ? "default" : "outline"}
                    onClick={() => setIsUnderline(!isUnderline)}
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={textAlign === "left" ? "default" : "outline"}
                    onClick={() => setTextAlign("left")}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={textAlign === "center" ? "default" : "outline"}
                    onClick={() => setTextAlign("center")}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={textAlign === "right" ? "default" : "outline"}
                    onClick={() => setTextAlign("right")}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm">Color:</span>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-8 p-0 border-0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "image" && (
        <div className="p-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button asChild className="w-full">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};
