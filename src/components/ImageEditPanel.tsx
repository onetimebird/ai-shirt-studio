import React, { useState, useCallback, useEffect } from 'react';
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

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending operations when component unmounts
      setIsRemovingBackground(false);
    };
  }, []);

  // Get the active canvas object with better error handling
  const getActiveImageObject = useCallback(() => {
    try {
      const canvas = (window as any).designCanvas?.canvas;
      if (!canvas || !canvas.getActiveObject) {
        console.warn('Canvas not available or not initialized');
        return null;
      }
      
      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        console.warn('No active object selected');
        return null;
      }
      
      if (activeObject.type !== 'image') {
        console.warn('Active object is not an image:', activeObject.type);
        return null;
      }
      
      return { canvas, activeObject };
    } catch (error) {
      console.error('Error getting active image object:', error);
      return null;
    }
  }, []);

  // Sync UI state with canvas object state - Initial sync
  useEffect(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { activeObject } = result;
    
    // Sync size state
    const scaleX = activeObject.scaleX || 1;
    setSize([Math.round(scaleX * 100)]);
    
    // Sync rotation state
    const angle = activeObject.angle || 0;
    setRotation([Math.round(angle)]);
    
    // Check if background was removed (simplified check)
    if (activeObject.src && activeObject.src.includes('replicate')) {
      setBackgroundRemoved(true);
    }
    
  }, [getActiveImageObject, imageUrl]);

  // Listen to canvas object modifications to sync sliders
  useEffect(() => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return;

    // Function to sync sliders when object is modified on canvas
    const handleObjectModified = (e: any) => {
      if (!e.target || e.target.type !== 'image') return;
      
      // Update size slider
      const scaleX = e.target.scaleX || 1;
      setSize([Math.round(scaleX * 100)]);
      
      // Update rotation slider
      const angle = e.target.angle || 0;
      setRotation([Math.round(angle)]);
    };

    // Function to handle real-time updates during transformation
    const handleObjectScaling = (e: any) => {
      if (!e.target || e.target.type !== 'image') return;
      const scaleX = e.target.scaleX || 1;
      setSize([Math.round(scaleX * 100)]);
    };

    const handleObjectRotating = (e: any) => {
      if (!e.target || e.target.type !== 'image') return;
      const angle = e.target.angle || 0;
      setRotation([Math.round(angle)]);
    };

    // Add event listeners
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:scaling', handleObjectScaling);
    canvas.on('object:rotating', handleObjectRotating);

    // Cleanup
    return () => {
      canvas.off('object:modified', handleObjectModified);
      canvas.off('object:scaling', handleObjectScaling);
      canvas.off('object:rotating', handleObjectRotating);
    };
  }, []);

  // Apply size changes to canvas
  const handleSizeChange = useCallback((newSize: number[]) => {
    try {
      setSize(newSize);
      const result = getActiveImageObject();
      if (!result) {
        toast.error("No image selected");
        return;
      }

      const { canvas, activeObject } = result;
      const scale = newSize[0] / 100; // Convert percentage to decimal
      
      if (scale <= 0 || scale > 10) {
        toast.error("Invalid size value");
        return;
      }
      
      activeObject.set({
        scaleX: scale,
        scaleY: scale
      });
      
      // Force update the object's bounding rect and controls
      activeObject.setCoords();
      canvas.requestRenderAll();
    } catch (error) {
      console.error('Size change error:', error);
      toast.error('Failed to change size');
    }
  }, [getActiveImageObject]);

  // Apply rotation changes to canvas
  const handleRotationChange = useCallback((newRotation: number[]) => {
    try {
      setRotation(newRotation);
      const result = getActiveImageObject();
      if (!result) {
        toast.error("No image selected");
        return;
      }

      const { canvas, activeObject } = result;
      activeObject.set({ angle: newRotation[0] });
      
      // Force update the object's bounding rect and controls
      activeObject.setCoords();
      canvas.requestRenderAll();
    } catch (error) {
      console.error('Rotation change error:', error);
      toast.error('Failed to rotate image');
    }
  }, [getActiveImageObject]);

  // Apply filter changes to canvas
  const handleFilterChange = useCallback((filter: 'normal' | 'grayscale' | 'high-contrast') => {
    setSelectedFilter(filter);
    const result = getActiveImageObject();
    if (!result) {
      toast.error("No image selected");
      return;
    }

    try {
      const { canvas, activeObject } = result;
      
      // Ensure fabric is available and has filters
      const fabric = (window as any).fabric;
      if (!fabric || !fabric.Image || !fabric.Image.filters) {
        console.warn('Fabric.js filters not available. Fabric object:', fabric);
        toast.error('Filter functionality not available');
        return;
      }
      
      const fabricFilters = fabric.Image.filters;
      
      // Initialize filters array if it doesn't exist
      if (!activeObject.filters) {
        activeObject.filters = [];
      }
      
      // Clear existing filters
      activeObject.filters.length = 0;
      
      // Apply new filter based on selection
      try {
        if (filter === 'grayscale' && fabricFilters.Grayscale) {
          activeObject.filters.push(new fabricFilters.Grayscale());
        } else if (filter === 'high-contrast') {
          if (fabricFilters.Contrast) {
            activeObject.filters.push(new fabricFilters.Contrast({ contrast: 0.4 }));
          }
          if (fabricFilters.Brightness) {
            activeObject.filters.push(new fabricFilters.Brightness({ brightness: 0.1 }));
          }
        }
        
        // Apply filters and render
        if (activeObject.applyFilters) {
          activeObject.applyFilters();
        }
        canvas.renderAll();
        
        const filterName = filter === 'normal' ? 'Original' : filter === 'grayscale' ? 'Grayscale' : 'High Contrast';
        toast.success(`${filterName} filter applied`);
      } catch (filterError) {
        console.error('Filter application error:', filterError);
        toast.error(`Failed to apply ${filter} filter`);
      }
    } catch (error) {
      console.error('Filter change error:', error);
      toast.error('Failed to change filter');
    }
  }, [getActiveImageObject]);

  // Center the image to the t-shirt center line
  const handleCenter = useCallback(() => {
    const result = getActiveImageObject();
    if (!result) return;

    const { canvas, activeObject } = result;
    
    // Center horizontally to the t-shirt center line (50% of canvas width)
    // Keep the current vertical position
    activeObject.set({
      left: canvas.width / 2,
      originX: 'center'
    });
    
    // Force update the object's bounding rect and controls
    activeObject.setCoords();
    
    // Clear and reselect to refresh selection bounds and controls
    canvas.discardActiveObject();
    canvas.setActiveObject(activeObject);
    canvas.requestRenderAll();
    
    toast.success("Image centered to t-shirt");
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
  const handleDuplicate = useCallback(async () => {
    const result = getActiveImageObject();
    if (!result) {
      toast.error("No image selected");
      return;
    }

    const { canvas, activeObject } = result;
    try {
      // Fabric.js v6 compatible clone method
      const cloned = await activeObject.clone();
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      toast.success("Image duplicated");
    } catch (error) {
      console.error('Clone error:', error);
      toast.error("Failed to duplicate image");
    }
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

  // Remove background using Replicate AI
  const handleRemoveBackground = useCallback(async () => {
    setIsRemovingBackground(true);
    const startTime = Date.now();
    
    try {
      // Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call Replicate background removal
      const { data, error } = await supabase.functions.invoke('remove-background-replicate', {
        body: { 
          imageUrl: imageUrl,
          model: 'u2net' // Best model for t-shirt graphics
        }
      });

      if (error) {
        console.error('Replicate removal error:', error);
        throw new Error(error.message || 'Background removal failed');
      }

      if (!data?.success || !data?.output_url) {
        throw new Error('No output from background removal');
      }

      const backgroundRemovedDataUrl = data.output_url;
      
      // Ensure minimum 8 seconds processing time for better UX
      const elapsedTime = Date.now() - startTime;
      const minimumProcessingTime = 8000; // 8 seconds
      const remainingTime = Math.max(0, minimumProcessingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      const result = getActiveImageObject();
      if (result) {
        const { canvas, activeObject } = result;
        
        // Update the image source
        activeObject.setSrc(backgroundRemovedDataUrl, () => {
          canvas.renderAll();
          setBackgroundRemoved(true);
          toast.success(`Background removed successfully!`);
        });
      }
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error("Failed to remove background");
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
    if (typeof window !== 'undefined' && (window as any).fabric?.Image?.filters) {
      activeObject.filters = [];
      activeObject.applyFilters();
    }
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
    <Card className="h-full flex flex-col relative">
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
                transform: `scale(${(size[0] / 100) * 1.75}) rotate(${rotation[0]}deg)`,
                filter: selectedFilter === 'grayscale' ? 'grayscale(100%)' : 
                       selectedFilter === 'high-contrast' ? 'contrast(150%)' : 'none'
              }}
            />
          </div>
        </div>

        {/* AI Background Removal */}
        <div className="border border-primary/20 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-300/40 group cursor-pointer">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI Background Removal
                </h4>
                <p className="text-sm text-muted-foreground">
                  Instantly remove backgrounds with AI
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRemoveBackground}
              disabled={isRemovingBackground || backgroundRemoved}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border-0"
            >
              {isRemovingBackground ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : backgroundRemoved ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Background Removed
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.678-2.153-1.415-3.414l5-5A2 2 0 009 9.586V5L8 4z" />
                  </svg>
                  Remove Background
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filters</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'normal', label: 'Normal' },
              { key: 'grayscale', label: 'Grayscale' },
              { key: 'high-contrast', label: 'Contrast' }
            ].map((filter) => (
              <button
                key={filter.key}
                className={`relative aspect-square rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center p-3 ${
                  selectedFilter === filter.key 
                    ? 'border-primary bg-primary/10 shadow-md shadow-primary/20' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/20'
                }`}
                onClick={() => handleFilterChange(filter.key as any)}
              >
                {/* Selected indicator */}
                {selectedFilter === filter.key && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center z-10 animate-scale-in">
                    <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                {/* Image preview - square */}
                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden mb-2 flex-shrink-0">
                  <img 
                    src={imageUrl} 
                    alt={filter.label}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                    style={{
                      filter: filter.key === 'grayscale' ? 'grayscale(100%)' : 
                             filter.key === 'high-contrast' ? 'contrast(150%) brightness(110%)' : 'none'
                    }}
                  />
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium text-center leading-tight transition-colors duration-200 ${
                  selectedFilter === filter.key 
                    ? 'text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {filter.label}
                </span>
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