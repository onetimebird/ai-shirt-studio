import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { X, RotateCcw, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { removeBackground, loadImage } from '@/lib/backgroundRemoval';

interface ImageEditPanelProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
}

export function ImageEditPanel({ imageUrl, onClose, onSave }: ImageEditPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'single-color' | 'black-white'>('normal');
  const [selectedColor, setSelectedColor] = useState('#4285f4');
  const [size, setSize] = useState([1.0]);
  const [rotation, setRotation] = useState([0]);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  const defaultColors = [
    '#4285f4', '#000000', '#1a365d', '#d69e2e', '#ffffff',
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'
  ];

  useEffect(() => {
    // Extract colors from image
    extractColorsFromImage(imageUrl);
  }, [imageUrl]);

  const extractColorsFromImage = async (url: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = new Set<string>();
        
        // Sample colors from the image
        for (let i = 0; i < imageData.data.length; i += 16) { // Sample every 4th pixel
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const alpha = imageData.data[i + 3];
          
          if (alpha > 128) { // Only consider non-transparent pixels
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            colors.add(hex);
            if (colors.size >= 8) break;
          }
        }
        
        setExtractedColors(Array.from(colors).slice(0, 8));
      };
      img.src = url;
    } catch (error) {
      console.error('Error extracting colors:', error);
      setExtractedColors(defaultColors);
    }
  };

  const handleRemoveBackground = async () => {
    setIsRemovingBackground(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const backgroundRemovedBlob = await removeBackground(img);
          const backgroundRemovedDataUrl = URL.createObjectURL(backgroundRemovedBlob);
          
          // Update the canvas object with the new image
          const canvas = (window as any).designCanvas?.canvas;
          if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.type === 'image') {
              const newImg = new Image();
              newImg.onload = () => {
                activeObject.setSrc(backgroundRemovedDataUrl, () => {
                  canvas.renderAll();
                });
              };
              newImg.src = backgroundRemovedDataUrl;
            }
          }
          
          setBackgroundRemoved(true);
          toast.success("Background removed successfully!");
        } catch (error) {
          console.error('Background removal error:', error);
          toast.error("Failed to remove background. Please try again.");
        }
      };
      img.src = imageUrl;
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to remove background. Please try again.");
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const applyChangesToCanvas = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') return;

    // Apply size
    const currentScale = activeObject.scaleX || 1;
    const newScale = currentScale * size[0];
    activeObject.set({
      scaleX: newScale,
      scaleY: newScale
    });

    // Apply rotation
    activeObject.set({
      angle: rotation[0]
    });

    // Apply filters
    const filters = [];
    if (selectedFilter === 'black-white') {
      filters.push(new (window as any).fabric.Image.filters.Grayscale());
      filters.push(new (window as any).fabric.Image.filters.Contrast({ contrast: 0.3 }));
    } else if (selectedFilter === 'single-color') {
      filters.push(new (window as any).fabric.Image.filters.Grayscale());
      // You could add color overlay here if needed
    }
    
    activeObject.filters = filters;
    activeObject.applyFilters();
    canvas.renderAll();
  };

  useEffect(() => {
    applyChangesToCanvas();
  }, [size, rotation, selectedFilter]);

  const handleSave = () => {
    applyChangesToCanvas();
    onSave?.(imageUrl);
    onClose();
    toast.success("Changes applied successfully!");
  };

  const handleResetToDefaults = () => {
    setSelectedFilter('normal');
    setSelectedColor(extractedColors[0] || '#4285f4');
    setSize([1.0]);
    setRotation([0]);
    setBackgroundRemoved(false);
    
    // Reset canvas object
    const canvas = (window as any).designCanvas?.canvas;
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.type === 'image') {
        activeObject.set({
          scaleX: 1,
          scaleY: 1,
          angle: 0
        });
        activeObject.filters = [];
        activeObject.applyFilters();
        canvas.renderAll();
      }
    }
  };

  const colorsToShow = extractedColors.length > 0 ? extractedColors : defaultColors;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Edit Your Artwork</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Our design professionals will select ink colors for you or tell us your preferred colors at checkout.
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-6">
        {/* Image Preview */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${size[0]}) rotate(${rotation[0]}deg)`,
                filter: selectedFilter === 'single-color' ? 'grayscale(1)' : 
                       selectedFilter === 'black-white' ? 'grayscale(1) contrast(2)' : 'none'
              }}
            />
          </div>
        </div>

        {/* AI Background Removal */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium">AI Background Removal</span>
                <p className="text-xs text-muted-foreground">Remove background automatically</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRemoveBackground}
                disabled={isRemovingBackground || backgroundRemoved}
              >
                {isRemovingBackground ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : backgroundRemoved ? (
                  'Background Removed'
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Remove Background
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Filters</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'normal', label: 'Normal' },
              { key: 'single-color', label: 'Single Color' },
              { key: 'black-white', label: 'Black/White' }
            ].map((filter) => (
              <div
                key={filter.key}
                className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                  selectedFilter === filter.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                <div className="w-full h-16 bg-muted rounded mb-2 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={filter.label}
                    className="w-full h-full object-contain"
                    style={{
                      filter: filter.key === 'single-color' ? 'grayscale(1)' : 
                             filter.key === 'black-white' ? 'grayscale(1) contrast(2)' : 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-center block">{filter.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Colors */}
        {selectedFilter === 'single-color' && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Edit Colors</h4>
            <p className="text-xs text-muted-foreground mb-3">
              {extractedColors.length > 0 ? 'Colors extracted from your image:' : 'Default color palette:'}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {colorsToShow.map((color, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-primary scale-110' : 'border-border hover:border-primary/50'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Size</span>
              <span className="text-sm text-muted-foreground">{size[0].toFixed(1)}x</span>
            </div>
            <Slider
              value={size}
              onValueChange={setSize}
              max={3}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Rotate</span>
              <span className="text-sm text-muted-foreground">{rotation[0]}°</span>
            </div>
            <Slider
              value={rotation}
              onValueChange={setRotation}
              max={360}
              min={-360}
              step={15}
              className="w-full"
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={handleResetToDefaults}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2">
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Center</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Layering</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Flip</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Lock</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Duplicate</span>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}