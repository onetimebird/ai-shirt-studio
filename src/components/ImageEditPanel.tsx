import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { X, RotateCcw, Wand2, Loader2, Palette, Move, RotateCw, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditPanelProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
}

export function ImageEditPanel({ imageUrl, onClose, onSave }: ImageEditPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'grayscale' | 'high-contrast'>('normal');
  const [size, setSize] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);

  // Get the active canvas object
  const getActiveImageObject = useCallback(() => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return null;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') return null;
    
    return { canvas, activeObject };
  }, []);

  // Apply size changes to canvas
  const handleSizeChange = useCallback((newSize: number[]) => {
    setSize(newSize);
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    const scale = newSize[0] / 100; // Convert percentage to decimal
    activeObject.set({
      scaleX: scale,
      scaleY: scale
    });
    canvas.renderAll();
  }, [getActiveImageObject]);

  // Apply rotation changes to canvas
  const handleRotationChange = useCallback((newRotation: number[]) => {
    setRotation(newRotation);
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    activeObject.set({ angle: newRotation[0] });
    canvas.renderAll();
  }, [getActiveImageObject]);

  // Apply filter changes to canvas
  const handleFilterChange = useCallback((filter: 'normal' | 'grayscale' | 'high-contrast') => {
    setSelectedFilter(filter);
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    
    // Clear existing filters
    activeObject.filters = [];
    
    // Apply new filter based on selection
    if (filter === 'grayscale') {
      activeObject.filters.push(new (window as any).fabric.Image.filters.Grayscale());
    } else if (filter === 'high-contrast') {
      activeObject.filters.push(new (window as any).fabric.Image.filters.Contrast({ contrast: 0.5 }));
    }
    
    activeObject.applyFilters();
    canvas.renderAll();
  }, [getActiveImageObject]);

  // Center the image on canvas
  const handleCenter = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    activeObject.center();
    canvas.renderAll();
    toast.success("Image centered");
  }, [getActiveImageObject]);

  // Send image to back layer
  const handleSendToBack = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    canvas.sendToBack(activeObject);
    canvas.renderAll();
    toast.success("Image sent to back layer");
  }, [getActiveImageObject]);

  // Flip image horizontally
  const handleFlip = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    activeObject.set('flipX', !activeObject.flipX);
    canvas.renderAll();
    toast.success("Image flipped");
  }, [getActiveImageObject]);

  // Duplicate the image
  const handleDuplicate = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    activeObject.clone((cloned: any) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      toast.success("Image duplicated");
    });
  }, [getActiveImageObject]);

  // Delete the image
  const handleDelete = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    canvas.remove(activeObject);
    canvas.renderAll();
    onClose(); // Close the panel since the object is deleted
    toast.success("Image deleted");
  }, [getActiveImageObject, onClose]);

  // Remove background using AI
  const handleRemoveBackground = useCallback(async () => {
    setIsRemovingBackground(true);
    try {
      // Import background removal function
      const { removeBackground } = await import('@/lib/backgroundRemoval');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const backgroundRemovedBlob = await removeBackground(img);
          const backgroundRemovedDataUrl = URL.createObjectURL(backgroundRemovedBlob);
          
          const result = getActiveImageObject();
          if (result) {
            const { canvas, activeObject } = result;
            
            // Update the image source
            activeObject.setSrc(backgroundRemovedDataUrl, () => {
              canvas.renderAll();
              setBackgroundRemoved(true);
              toast.success("Background removed successfully!");
            });
          }
        } catch (error) {
          console.error('Background removal error:', error);
          toast.error("Failed to remove background");
        }
      };
      
      img.onerror = () => {
        toast.error("Failed to load image");
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Background removal feature not available");
    } finally {
      setIsRemovingBackground(false);
    }
  }, [imageUrl, getActiveImageObject]);

  // Reset all values to defaults
  const handleReset = useCallback(() => {
    setSize([100]);
    setRotation([0]);
    setSelectedFilter('normal');
    setBackgroundRemoved(false);
    
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    activeObject.set({
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      flipX: false,
      flipY: false
    });
    activeObject.filters = [];
    activeObject.applyFilters();
    canvas.renderAll();
    toast.success("Reset to defaults");
  }, [getActiveImageObject]);

  // Save changes
  const handleSave = useCallback(() => {
    onSave?.(imageUrl);
    toast.success("Changes saved!");
    onClose();
  }, [imageUrl, onSave, onClose]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Edit Your Artwork
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize your image with filters, transformations, and AI-powered tools.
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 overflow-y-auto">
        {/* Image Preview */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border-2 border-border">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${size[0] / 100}) rotate(${rotation[0]}deg)`,
                filter: selectedFilter === 'grayscale' ? 'grayscale(100%)' : 
                       selectedFilter === 'high-contrast' ? 'contrast(150%)' : 'none'
              }}
            />
          </div>
        </div>

        {/* AI Background Removal */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">AI Background Removal</div>
                <div className="text-xs text-muted-foreground">
                  Remove background automatically using AI
                </div>
              </div>
              <Button 
                variant={backgroundRemoved ? "secondary" : "default"}
                size="sm"
                onClick={handleRemoveBackground}
                disabled={isRemovingBackground || backgroundRemoved}
                className="ml-4"
              >
                {isRemovingBackground ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : backgroundRemoved ? (
                  'Background Removed'
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 mr-2" />
                    Remove BG
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Filters</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'normal', label: 'Normal' },
              { key: 'grayscale', label: 'Grayscale' },
              { key: 'high-contrast', label: 'High Contrast' }
            ].map((filter) => (
              <button
                key={filter.key}
                className={`p-3 rounded-lg border-2 transition-all hover:border-primary/50 ${
                  selectedFilter === filter.key 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border'
                }`}
                onClick={() => handleFilterChange(filter.key as any)}
              >
                <div className="w-full h-12 bg-muted rounded mb-2 overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={filter.label}
                    className="w-full h-full object-contain"
                    style={{
                      filter: filter.key === 'grayscale' ? 'grayscale(100%)' : 
                             filter.key === 'high-contrast' ? 'contrast(150%)' : 'none'
                    }}
                  />
                </div>
                <span className="text-xs font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transform Controls */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Transform</h4>
          
          {/* Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Size</span>
              <span className="text-sm text-muted-foreground">{size[0]}%</span>
            </div>
            <Slider
              value={size}
              onValueChange={handleSizeChange}
              max={300}
              min={10}
              step={10}
              className="w-full"
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Rotation</span>
              <span className="text-sm text-muted-foreground">{rotation[0]}°</span>
            </div>
            <Slider
              value={rotation}
              onValueChange={handleRotationChange}
              max={360}
              min={-360}
              step={15}
              className="w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleCenter}>
              <Move className="w-3 h-3 mr-2" />
              Center
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendToBack}>
              <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Layer
            </Button>
            <Button variant="outline" size="sm" onClick={handleFlip}>
              <RotateCw className="w-3 h-3 mr-2" />
              Flip
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="w-3 h-3 mr-2" />
              Duplicate
            </Button>
          </div>
          
          {/* Delete Button - Full Width */}
          <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full">
            <Trash2 className="w-3 h-3 mr-2" />
            Delete Image
          </Button>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full"
          size="lg"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}