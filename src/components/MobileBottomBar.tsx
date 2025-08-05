import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShirtIcon, Palette, MonitorSpeaker, Scissors, Package, Type, Upload, Settings, X, FolderOpen } from "lucide-react";
import { MobileThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { GILDAN_2000_COLORS, getAllColors } from "@/data/gildan2000Colors";
import { GILDAN_64000_COLORS, getAllColors as getAllColors64000 } from "@/data/gildan64000Colors";
import { BELLA_3001C_COLORS, getAllColors as getAllColorsBella } from "@/data/bellaColors";
import { BELLA_6400_COLORS, getAllColors as getAllColorsBella6400 } from "@/data/bella6400Colors";
import { GILDAN_18000_COLORS, getAllColors as getAllColors18000 } from "@/data/gildan18000Colors";
import { GILDAN_18500_COLORS, getAllColors as getAllColors18500 } from "@/data/gildan18500Colors";
import { BELLA_3719_COLORS, getAllColors as getAllColors3719 } from "@/data/bella3719Colors";
import { AIWandIcon } from "@/components/AIWandIcon";
import { RightPanel } from "@/components/RightPanel";
import { ProductSelector } from "@/components/ProductSelector";
import { SavedDesignsPanel } from "@/components/SavedDesignsPanel";
import { supabase } from "@/integrations/supabase/client";

interface MobileBottomBarProps {
  selectedProduct: string;
  selectedColor: string;
  decorationMethod: string;
  onProductChange: (product: string) => void;
  onColorChange: (color: string) => void;
  onDecorationChange: (method: string) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
  selectedObject: any;
  onTextPropertiesChange: (properties: any) => void;
  onImageUpload: (file: File) => void;
  onProductColorChange: (color: string) => void;
  textObjects: any[];
  imageObjects: any[];
  uploadedFile: File | null;
  onSheetOpenChange?: (isOpen: boolean) => void;
  onLoadDesign?: (designData: any) => void;
}

export const MobileBottomBar = ({
  selectedProduct,
  selectedColor,
  decorationMethod,
  onProductChange,
  onColorChange,
  onDecorationChange,
  activeTool,
  onToolChange,
  selectedObject,
  onTextPropertiesChange,
  onImageUpload,
  onProductColorChange,
  textObjects,
  imageObjects,
  uploadedFile,
  onSheetOpenChange,
  onLoadDesign,
}: MobileBottomBarProps) => {
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [textSheetOpen, setTextSheetOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [loadSheetOpen, setLoadSheetOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const isAnySheetOpen = productSheetOpen || colorSheetOpen || textSheetOpen || uploadSheetOpen || aiSheetOpen || settingsSheetOpen || loadSheetOpen;

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

  useEffect(() => {
    onSheetOpenChange?.(isAnySheetOpen);
  }, [isAnySheetOpen, onSheetOpenChange]);

  return (
    <div className="md:hidden bg-gradient-card border-t border-border backdrop-blur-sm shadow-glass">
      {/* Single Horizontal Scrollable Bar with All Icons */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 px-4 py-3 min-w-max">
          {/* Product & Color Selector */}
          <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="glass" 
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1">
                  <ShirtIcon className="w-3 h-3" />
                  <div 
                    className="w-3 h-3 rounded border border-border" 
                    style={{ backgroundColor: currentColor?.value }}
                  />
                </div>
                <span className="text-[10px] leading-tight">Product</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Select Product & Color</SheetTitle>
                <p className="text-sm text-muted-foreground">Choose your product and color</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <ProductSelector
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={onProductChange}
                  onColorChange={onColorChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Add Text */}
          <Sheet open={textSheetOpen} onOpenChange={setTextSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "text" ? "default" : "glass"}
                size="sm"
                onClick={() => onToolChange("text")}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Type className="w-4 h-4" />
                <span className="text-[10px] leading-tight">Text</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Text Editor</SheetTitle>
                <p className="text-sm text-muted-foreground">Add and customize text for your design</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="text"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={onTextPropertiesChange}
                  onImageUpload={onImageUpload}
                  onProductColorChange={onProductColorChange}
                  textObjects={textObjects}
                  imageObjects={imageObjects}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={onProductChange}
                  uploadedFile={uploadedFile}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Upload Art */}
          <Sheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "upload" ? "default" : "glass"}
                size="sm"
                onClick={() => onToolChange("upload")}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Upload className="w-4 h-4" />
                <span className="text-[10px] leading-tight">Upload</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Upload Your Own Image</SheetTitle>
                <p className="text-sm text-muted-foreground">Add your custom artwork to the design</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="upload"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={onTextPropertiesChange}
                  onImageUpload={onImageUpload}
                  onProductColorChange={onProductColorChange}
                  textObjects={textObjects}
                  imageObjects={imageObjects}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={onProductChange}
                  uploadedFile={uploadedFile}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* AI Art */}
          <Sheet open={aiSheetOpen} onOpenChange={setAiSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant={activeTool === "ai" ? "default" : "glass"}
                size="sm"
                onClick={() => onToolChange("ai")}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <AIWandIcon size={16} />
                <span className="text-[10px] leading-tight">AI Art</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Add Art <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded ml-2">AI</span></SheetTitle>
                <p className="text-sm text-muted-foreground">Generate custom artwork with AI</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool="ai"
                  selectedObject={selectedObject}
                  onTextPropertiesChange={onTextPropertiesChange}
                  onImageUpload={onImageUpload}
                  onProductColorChange={onProductColorChange}
                  textObjects={textObjects}
                  imageObjects={imageObjects}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={onProductChange}
                  uploadedFile={uploadedFile}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Load Saved Design - Only show when logged in */}
          {isUserLoggedIn && (
            <Sheet open={loadSheetOpen} onOpenChange={setLoadSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="glass"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-[10px] leading-tight">Load</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
                <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                  <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                    <X className="h-4 w-4" />
                  </SheetClose>
                  <SheetTitle className="text-lg">Load Saved Design</SheetTitle>
                  <p className="text-sm text-muted-foreground">Choose from your saved designs</p>
                </SheetHeader>
                <div className="overflow-y-auto h-full pb-20">
                  <SavedDesignsPanel
                    onLoadDesign={(designData) => {
                      onLoadDesign?.(designData);
                      setLoadSheetOpen(false);
                    }}
                    onClose={() => setLoadSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Properties */}
          <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="glass"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Settings className="w-4 h-4" />
                <span className="text-[10px] leading-tight">Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 relative">
                <SheetClose className="absolute right-4 top-4 p-1 hover:bg-muted rounded-sm">
                  <X className="h-4 w-4" />
                </SheetClose>
                <SheetTitle className="text-lg">Properties</SheetTitle>
                <p className="text-sm text-muted-foreground">Customize selected elements</p>
              </SheetHeader>
              <div className="overflow-y-auto h-full pb-20 px-4">
                <RightPanel
                  activeTool={activeTool}
                  selectedObject={selectedObject}
                  onTextPropertiesChange={onTextPropertiesChange}
                  onImageUpload={onImageUpload}
                  onProductColorChange={onProductColorChange}
                  textObjects={textObjects}
                  imageObjects={imageObjects}
                  selectedProduct={selectedProduct}
                  selectedColor={selectedColor}
                  onProductChange={onProductChange}
                  uploadedFile={uploadedFile}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Digital Print Button */}
          <Button 
            variant={decorationMethod === "screen-print" ? "default" : "glass"}
            size="sm"
            onClick={() => onDecorationChange("screen-print")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <MonitorSpeaker className="w-4 h-4" />
            <span className="text-[10px] leading-tight">Digital</span>
          </Button>

          {/* Embroidery Button */}
          <Button 
            variant={decorationMethod === "embroidery" ? "default" : "glass"}
            size="sm"
            onClick={() => onDecorationChange("embroidery")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <Scissors className="w-4 h-4" />
            <span className="text-[10px] leading-tight">Embroider</span>
          </Button>

          {/* Theme Toggle */}
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <MobileThemeToggle />
            <span className="text-[10px] leading-tight">Theme</span>
          </div>

          {/* Spacer for scrolling */}
          <div className="w-4 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};