import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Palette, ShirtIcon, Save, ArrowRight, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { QuantityModal } from "@/components/QuantityModal";
import { SaveDesignModal } from "@/components/SaveDesignModal";
import { SavedDesignsPanel } from "@/components/SavedDesignsPanel";
import { supabase } from "@/integrations/supabase/client";
import { useDesign } from "@/contexts/DesignContext";
import { GILDAN_2000_COLORS, getAllColors } from "@/data/gildan2000Colors";
import { GILDAN_64000_COLORS, getAllColors as getAllColors64000 } from "@/data/gildan64000Colors";
import { BELLA_3001C_COLORS, getAllColors as getAllColorsBella } from "@/data/bellaColors";
import { BELLA_6400_COLORS, getAllColors as getAllColorsBella6400 } from "@/data/bella6400Colors";
import { GILDAN_18000_COLORS, getAllColors as getAllColors18000 } from "@/data/gildan18000Colors";
import { GILDAN_18500_COLORS, getAllColors as getAllColors18500 } from "@/data/gildan18500Colors";
import { BELLA_3719_COLORS, getAllColors as getAllColors3719 } from "@/data/bella3719Colors";
import { EmbroideryGuidelinesModal } from './EmbroideryGuidelinesModal';

interface BottomBarProps {
  selectedProduct: string;
  selectedColor: string;
  decorationMethod: "screen-print" | "embroidery";
  onProductChange: (product: string) => void;
  onColorChange: (color: string) => void;
  onDecorationChange: (method: "screen-print" | "embroidery") => void;
  onSaveModalChange?: (isOpen: boolean) => void;
  onLoadPanelChange?: (isOpen: boolean) => void;
  onEmbroideryModalChange?: (isOpen: boolean) => void;
}

export const BottomBar = ({
  selectedProduct,
  selectedColor,
  decorationMethod,
  onProductChange,
  onColorChange,
  onDecorationChange,
  onSaveModalChange,
  onLoadPanelChange,
  onEmbroideryModalChange,
}: BottomBarProps) => {
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showEmbroideryGuidelines, setShowEmbroideryGuidelines] = useState(false);
  const { currentDesignData } = useDesign();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsUserLoggedIn(!!user);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsUserLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);
  // Get current color based on selected product
  const getCurrentColors = () => {
    switch (selectedProduct) {
      case 'gildan-64000':
        return GILDAN_64000_COLORS;
      case 'bella-3001c':
        return BELLA_3001C_COLORS;
      case 'bella-6400':
        return BELLA_6400_COLORS;
      case 'gildan-18000':
        return GILDAN_18000_COLORS;
      case 'gildan-18500':
        return GILDAN_18500_COLORS;
      case 'bella-3719':
        return BELLA_3719_COLORS;
      default:
        return GILDAN_2000_COLORS;
    }
  };

  const getAllCurrentColors = () => {
    switch (selectedProduct) {
      case 'gildan-64000':
        return getAllColors64000();
      case 'bella-3001c':
        return getAllColorsBella();
      case 'bella-6400':
        return getAllColorsBella6400();
      case 'gildan-18000':
        return getAllColors18000();
      case 'gildan-18500':
        return getAllColors18500();
      case 'bella-3719':
        return getAllColors3719();
      default:
        return getAllColors();
    }
  };

  const currentColor = getCurrentColors().find(c => c.name === selectedColor);

  // Helper functions for design operations
  const getDesignData = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return null;
    
    return {
      canvasData: canvas.toJSON(),
      currentSide: (window as any).designCanvas?.currentSide || 'front',
      objects: canvas.getObjects().filter((obj: any) => obj.type !== 'image' || !obj.isBackground),
      productType: selectedProduct,
      productColor: selectedColor
    };
  };

  const loadDesignData = (designData: any) => {
    console.log('[BottomBar] loadDesignData called with:', designData);
    console.log('[BottomBar] Design data structure:', {
      hasCanvasData: !!designData?.canvasData,
      canvasDataKeys: designData?.canvasData ? Object.keys(designData.canvasData) : [],
      designDataKeys: Object.keys(designData || {})
    });
    
    const canvas = (window as any).designCanvas?.canvas;
    console.log('[BottomBar] Canvas exists:', !!canvas);
    console.log('[BottomBar] Canvas dimensions:', canvas ? { width: canvas.width, height: canvas.height } : 'N/A');
    
    if (!canvas) {
      console.error('[BottomBar] Canvas not available');
      return;
    }
    
    if (!designData) {
      console.error('[BottomBar] No design data provided');
      return;
    }

    // Clear only non-background objects
    const objects = canvas.getObjects();
    console.log('[BottomBar] Current canvas objects before clear:', objects.length);
    console.log('[BottomBar] Object types:', objects.map(o => ({ type: o.type, isBackground: o.isBackground })));
    
    const objectsToRemove = objects.filter((obj: any) => !obj.isBackground);
    console.log('[BottomBar] Removing', objectsToRemove.length, 'non-background objects');
    
    objectsToRemove.forEach((obj: any) => {
      canvas.remove(obj);
    });

    // Load the saved design objects
    if (designData.canvasData && designData.canvasData.objects) {
      console.log('[BottomBar] Loading canvas data with', designData.canvasData.objects.length, 'total objects');
      console.log('[BottomBar] Full canvas data:', designData.canvasData);
      
      // Filter only non-background objects from the saved design
      const objectsToLoad = designData.canvasData.objects.filter((objData: any) => {
        console.log('[BottomBar] Checking object:', { type: objData.type, isBackground: objData.isBackground });
        return !objData.isBackground;
      });
      console.log('[BottomBar] Filtered objects to load:', objectsToLoad.length);
      console.log('[BottomBar] Objects to load details:', objectsToLoad.map(o => ({ type: o.type, text: o.text, src: o.src })));
      
      if (objectsToLoad.length > 0) {
        console.log('[BottomBar] Using Fabric v6 object creation approach');
        
        // In Fabric.js v6, we need to create objects manually from the JSON data
        const loadObjectsSequentially = async () => {
          for (const objData of objectsToLoad) {
            console.log('[BottomBar] Creating object from data:', objData.type, objData);
            
            try {
              let fabricObject;
              
              if (objData.type === 'Text') {
                const { Text } = await import('fabric');
                fabricObject = new Text(objData.text || '', {
                  left: objData.left,
                  top: objData.top,
                  fill: objData.fill,
                  fontSize: objData.fontSize,
                  fontFamily: objData.fontFamily,
                  fontWeight: objData.fontWeight,
                  fontStyle: objData.fontStyle,
                  textAlign: objData.textAlign,
                  angle: objData.angle,
                  scaleX: objData.scaleX,
                  scaleY: objData.scaleY,
                  originX: objData.originX,
                  originY: objData.originY,
                  opacity: objData.opacity,
                  visible: objData.visible
                });
              } else if (objData.type === 'Image') {
                const { FabricImage } = await import('fabric');
                // For images, we need to load the image first
                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                  img.onload = resolve;
                  img.onerror = reject;
                  img.src = objData.src;
                });
                
                fabricObject = new FabricImage(img, {
                  left: objData.left,
                  top: objData.top,
                  angle: objData.angle,
                  scaleX: objData.scaleX,
                  scaleY: objData.scaleY,
                  originX: objData.originX,
                  originY: objData.originY,
                  opacity: objData.opacity,
                  visible: objData.visible
                });
              } else if (objData.type === 'Rect') {
                const { Rect } = await import('fabric');
                fabricObject = new Rect({
                  left: objData.left,
                  top: objData.top,
                  width: objData.width,
                  height: objData.height,
                  fill: objData.fill,
                  angle: objData.angle,
                  scaleX: objData.scaleX,
                  scaleY: objData.scaleY,
                  originX: objData.originX,
                  originY: objData.originY,
                  opacity: objData.opacity,
                  visible: objData.visible
                });
              } else if (objData.type === 'Circle') {
                const { Circle } = await import('fabric');
                fabricObject = new Circle({
                  left: objData.left,
                  top: objData.top,
                  radius: objData.radius,
                  fill: objData.fill,
                  angle: objData.angle,
                  scaleX: objData.scaleX,
                  scaleY: objData.scaleY,
                  originX: objData.originX,
                  originY: objData.originY,
                  opacity: objData.opacity,
                  visible: objData.visible
                });
              } else {
                console.warn('[BottomBar] Unknown object type:', objData.type);
                continue;
              }
              
              if (fabricObject) {
                console.log('[BottomBar] Adding object to canvas:', objData.type);
                canvas.add(fabricObject);
                
                // Apply custom controls if needed
                if (objData.type === 'Text' || objData.type === 'Image') {
                  import('@/lib/fabricTextControls').then(({ applyCustomControlsToObject }) => {
                    applyCustomControlsToObject(fabricObject);
                  });
                }
              }
            } catch (error) {
              console.error('[BottomBar] Error creating object:', error, objData);
            }
          }
          
          canvas.renderAll();
          console.log('[BottomBar] Final canvas objects after load:', canvas.getObjects().length);
          console.log('[BottomBar] Final object types:', canvas.getObjects().map(o => ({ type: o.type, isBackground: o.isBackground })));
          
          // Update object lists
          setTimeout(() => {
            if ((window as any).designCanvas?.updateTextObjects) {
              (window as any).designCanvas.updateTextObjects();
            }
            if ((window as any).designCanvas?.updateImageObjects) {
              (window as any).designCanvas.updateImageObjects();
            }
          }, 100);
        };
        
        loadObjectsSequentially();
      } else {
        console.log('[BottomBar] No objects to load');
        canvas.renderAll();
      }
    } else {
      console.log('[BottomBar] No canvasData found in design data');
      console.log('[BottomBar] Design data structure check:', {
        hasCanvasData: !!designData.canvasData,
        canvasDataType: typeof designData.canvasData,
        designDataKeys: Object.keys(designData)
      });
    }
  };

  const generatePreviewImage = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return undefined;
    
    try {
      return canvas.toDataURL({ format: 'png', quality: 0.8 });
    } catch (error) {
      console.warn('[BottomBar] Failed to generate preview image (tainted canvas):', error);
      return undefined;
    }
  };

  const handleSaveDesign = () => {
    if (!isUserLoggedIn) {
      toast.error("Please log in to save designs");
      return;
    }
    
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) {
      toast.error("Canvas not ready");
      return;
    }
    
    const hasObjects = canvas.getObjects().some((obj: any) => 
      obj.type !== 'image' || !obj.isBackground
    );
    
    if (!hasObjects) {
      toast.error("No design to save");
      return;
    }
    
    setIsSaveModalOpen(true);
    onSaveModalChange?.(true);
  };

  // Check if there's a design on canvas
  const hasDesignOnCanvas = () => {
    const canvas = (window as any).designCanvas?.canvas;
    return canvas && canvas.getObjects().some((obj: any) => 
      obj.type !== 'image' || !obj.isBackground
    );
  };

  const handleNextStep = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }
    
    // Check if current design has objects that could be saved
    const canvas = (window as any).designCanvas?.canvas;
    const hasDesignObjects = canvas && canvas.getObjects().some((obj: any) => 
      obj.type !== 'image' || !obj.isBackground
    );
    
    // If there's a design but it's not saved (no currentDesignData.id), prompt to save first
    if (hasDesignObjects && !currentDesignData?.id) {
      toast.error("Please save your design before proceeding to checkout");
      setIsSaveModalOpen(true);
      onSaveModalChange?.(true);
      return;
    }
    
    setIsQuantityModalOpen(true);
  };

  return (
    <div className="sticky bottom-0 bg-gradient-card border-t border-border px-4 py-4 shadow-glass backdrop-blur-sm z-40">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
        {/* Left Side - Product and Color Selectors */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Product Selector */}
          <div className="flex items-center gap-2">
            <img src="/icons/tshirt.svg" className="w-4 h-4 text-muted-foreground icon-hover flex-shrink-0" alt="T-Shirt" />
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger className="w-56 h-14 text-base relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-md hover:scale-[1.02] hover:bg-accent/20 transition-all duration-300">
                <SelectValue placeholder="Change Product">
                  {(() => {
                    const productMap: { [key: string]: string } = {
                      'gildan-2000': 'Gildan 2000 Ultra Cotton T-Shirt',
                      'gildan-64000': 'Gildan 64000 Softstyle T-Shirt',
                      'bella-3001c': 'Bella 3001 Premium T-Shirt',
                      'bella-6400': 'Bella 6400 Premium Women\'s Tee',
                      'gildan-18000': 'Gildan 18000 Crewneck',
                      'gildan-18500': 'Gildan 18500 Hoodie',
                      'bella-3719': 'Bella 3719 Premium Hoodie'
                    };
                    return <span className="truncate block">{productMap[selectedProduct] || 'Select Product'}</span>;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-[120]">
                <SelectItem value="gildan-2000">Gildan 2000 Ultra Cotton T-Shirt</SelectItem>
                <SelectItem value="gildan-64000">Gildan 64000 Softstyle T-Shirt</SelectItem>
                <SelectItem value="bella-3001c">Bella 3001 Premium T-Shirt</SelectItem>
                <SelectItem value="bella-6400">Bella 6400 Premium Women's Tee</SelectItem>
                <SelectItem value="gildan-18000">Gildan 18000 Crewneck</SelectItem>
                <SelectItem value="gildan-18500">Gildan 18500 Hoodie</SelectItem>
                <SelectItem value="bella-3719">Bella 3719 Premium Hoodie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <img src="/icons/swatch.png" className="w-5 h-5 text-muted-foreground icon-hover flex-shrink-0" alt="Color Swatch" />
            <Select value={selectedColor} onValueChange={onColorChange}>
              <SelectTrigger className="w-48 h-14 text-base relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-md hover:scale-[1.02] hover:bg-accent/20 transition-all duration-300">
                <SelectValue placeholder="Change Color">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border border-border" 
                      style={{ backgroundColor: currentColor?.value }}
                    />
                    <span>{currentColor?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-[120] max-h-80 overflow-y-auto">
                {getAllCurrentColors().map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        className="w-4 h-4 rounded border border-border flex-shrink-0" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="flex-1">{color.label}</span>
                      {!color.available && <span className="text-xs text-muted-foreground">Coming Soon</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center - Decoration Method */}
        <div className="flex items-center gap-2 mx-8">
          <Button
            variant={decorationMethod === "screen-print" ? "default" : "outline"}
            size="lg"
            onClick={() => onDecorationChange("screen-print")}
            className="h-14 px-6 text-base"
          >
            Digital Print
          </Button>
          <Button
            variant={decorationMethod === "embroidery" ? "default" : "outline"}
            size="lg"
            onClick={() => {
              console.log('[BottomBar] Embroidery button clicked, current method:', decorationMethod);
              console.log('[BottomBar] Opening embroidery guidelines modal');
              
              // Set decoration method to embroidery FIRST
              console.log('[BottomBar] Setting decoration method to embroidery');
              onDecorationChange("embroidery");
              
              // Then open modal
              setShowEmbroideryGuidelines(true);
              onEmbroideryModalChange?.(true);
            }}
            className="h-14 px-6 text-base"
          >
            Embroidery
          </Button>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Save Design Button */}
          <Button 
            variant="creative" 
            size="lg"
            onClick={handleSaveDesign}
            className="text-base px-6 py-3 h-12"
          >
            <Save className="w-5 h-5 mr-2 icon-hover" />
            Save Design
          </Button>

          {/* Load Design Button - Only shown when logged in */}
          {isUserLoggedIn && (
            <Sheet open={isLoadPanelOpen} onOpenChange={(open) => {
              setIsLoadPanelOpen(open);
              onLoadPanelChange?.(open);
            }}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-base px-6 py-3 h-12"
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Load Design
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Load Design</SheetTitle>
                </SheetHeader>
                <SavedDesignsPanel 
                  onLoadDesign={loadDesignData}
                  onClose={() => setIsLoadPanelOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* Next Step Button - 1.5x larger (Desktop Only) */}
          <Button 
            size="lg"
            onClick={handleNextStep}
            className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-lg px-8 py-4 h-16 min-w-[200px] ${hasDesignOnCanvas() ? 'subtle-glow' : ''}`}
          >
            <img src="/icons/long-arrow-right.png" className="w-12 h-8 mr-3 filter brightness-0 invert" alt="Next Step" />
            Next Step
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Product and Color Selectors */}
        <div className="flex items-center gap-2">
          {/* Product Selector */}
          <Select value={selectedProduct} onValueChange={onProductChange}>
            <SelectTrigger className="flex-1 h-12 text-sm relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-md hover:scale-[1.02] hover:bg-accent/20 transition-all duration-300">
              <SelectValue placeholder="Change Product">
                {(() => {
                  const productMap: { [key: string]: string } = {
                    'gildan-2000': 'Gildan 2000',
                    'gildan-64000': 'Gildan 64000',
                    'bella-3001c': 'Bella 3001',
                    'bella-6400': 'Bella 6400',
                    'gildan-18000': 'Gildan 18000',
                    'gildan-18500': 'Gildan 18500',
                    'bella-3719': 'Bella 3719'
                  };
                  return <span className="truncate block text-xs">{productMap[selectedProduct] || 'Select Product'}</span>;
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-[120]">
              <SelectItem value="gildan-2000">Gildan 2000 Ultra Cotton T-Shirt</SelectItem>
              <SelectItem value="gildan-64000">Gildan 64000 Softstyle T-Shirt</SelectItem>
              <SelectItem value="bella-3001c">Bella 3001 Premium T-Shirt</SelectItem>
              <SelectItem value="bella-6400">Bella 6400 Premium Women's Tee</SelectItem>
              <SelectItem value="gildan-18000">Gildan 18000 Crewneck</SelectItem>
              <SelectItem value="gildan-18500">Gildan 18500 Hoodie</SelectItem>
              <SelectItem value="bella-3719">Bella 3719 Premium Hoodie</SelectItem>
            </SelectContent>
          </Select>

          {/* Color Picker */}
          <Select value={selectedColor} onValueChange={onColorChange}>
            <SelectTrigger className="flex-1 h-12 text-sm relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-md hover:scale-[1.02] hover:bg-accent/20 transition-all duration-300">
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded border border-border" 
                  style={{ backgroundColor: currentColor?.value }}
                />
                <span className="text-xs">{currentColor?.label}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-[120] max-h-80 overflow-y-auto">
              {getAllCurrentColors().map((color) => (
                <SelectItem key={color.name} value={color.name}>
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-4 h-4 rounded border border-border flex-shrink-0" 
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="flex-1">{color.label}</span>
                    {!color.available && <span className="text-xs text-muted-foreground">Coming Soon</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Decoration Method with dividers */}
        <div className="flex items-center gap-2">
          <Button
            variant={decorationMethod === "screen-print" ? "default" : "outline"}
            size="sm"
            onClick={() => onDecorationChange("screen-print")}
            className="flex-1 h-12 text-sm"
          >
            Digital Print
          </Button>
          <Button
            variant={decorationMethod === "embroidery" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              console.log('[BottomBar Mobile] Embroidery button clicked, current method:', decorationMethod);
              
              // Set decoration method to embroidery FIRST
              console.log('[BottomBar Mobile] Setting decoration method to embroidery');
              onDecorationChange("embroidery");
              
              // Then open modal
              setShowEmbroideryGuidelines(true);
              onEmbroideryModalChange?.(true);
            }}
            className="flex-1 h-12 text-sm"
          >
            Embroidery
          </Button>
        </div>

        {/* Mobile Action Buttons with dividers */}
        <div className="flex items-center gap-2">
          {/* Save Design Button */}
          <Button 
            variant="creative" 
            size="sm"
            onClick={handleSaveDesign}
            className="flex-1 text-sm px-4 py-3 h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          {/* Load Design Button - Only shown when logged in */}
          {isUserLoggedIn && (
            <Sheet open={isLoadPanelOpen} onOpenChange={(open) => {
              setIsLoadPanelOpen(open);
              onLoadPanelChange?.(open);
            }}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 text-sm px-4 py-3 h-12"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Load Design</SheetTitle>
                </SheetHeader>
                <SavedDesignsPanel 
                  onLoadDesign={loadDesignData}
                  onClose={() => setIsLoadPanelOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}

        </div>
      </div>

      {/* Quantity Modal */}
      <QuantityModal 
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
        decorationMethod={decorationMethod}
      />

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          onSaveModalChange?.(false);
        }}
        designData={getDesignData()}
        productType={selectedProduct}
        productColor={selectedColor}
        previewImage={generatePreviewImage()}
      />

      <EmbroideryGuidelinesModal
        isOpen={showEmbroideryGuidelines}
        onClose={() => {
          setShowEmbroideryGuidelines(false);
          onEmbroideryModalChange?.(false);
        }}
      />
    </div>
  );
};