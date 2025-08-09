import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Shirt, 
  Upload, 
  Type, 
  Palette,
  Wand2,
  RotateCcw,
  HelpCircle,
  Share2
} from "lucide-react";
import { AIWandIcon } from "@/components/AIWandIcon";
import { HelpChatbot } from "@/components/HelpChatbot";
import { ShareDesignModal } from "@/components/ShareDesignModal";
import { SaveDesignModal } from "@/components/SaveDesignModal";
import { useDesign } from "@/contexts/DesignContext";
import { toast } from "@/hooks/use-toast";

interface LeftToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  designData?: any;
  productType?: string;
  productColor?: string;
  previewImage?: string;
  onShareModalChange?: (isOpen: boolean) => void;
}

const tools = [
  { id: "upload", label: "Upload Image", icon: () => <img src="/icons/cloud-upload.svg" className="w-5 h-5" alt="Upload" /> },
  { id: "text", label: "Add Text", icon: Type },
  { id: "ai", label: "AI Image Generator", icon: Wand2 },
  { id: "products", label: "Change Product", icon: () => <img src="/icons/tshirt.svg" className="w-5 h-5" alt="T-Shirt" /> },
  { id: "reset", label: "Reset Design", icon: () => <img src="/icons/reset-design.png" className="w-5 h-5" alt="Reset Design" /> },
];

export const LeftToolbar = ({ 
  activeTool, 
  onToolChange, 
  designData, 
  productType = "t-shirt", 
  productColor = "white",
  previewImage,
  onShareModalChange 
}: LeftToolbarProps) => {
  const [isHelpChatOpen, setIsHelpChatOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const { currentDesignData, isLoading } = useDesign();

  const handleShareDesign = async () => {
    // Check if design has content (either passed designData or from context)
    const currentData = designData || currentDesignData;
    const hasContent = currentData && (
      (currentData.textObjects && currentData.textObjects.length > 0) ||
      (currentData.imageObjects && currentData.imageObjects.length > 0)
    );

    if (!hasContent) {
      toast({
        title: "No design to share",
        description: "Please add some text or images to your design first.",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll open the share modal directly
    // In a real app, you'd check if design is saved and prompt to save/email first
    setIsShareModalOpen(true);
    onShareModalChange?.(true);
  };
  return (
    <TooltipProvider>
      <div className="w-16 lg:w-64 bg-gradient-sidebar border-r border-border flex flex-col shadow-glass backdrop-blur-sm">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border">
          <div className="hidden lg:block">
            <h2 className="font-semibold text-lg">Design Studio</h2>
            <p className="text-xs text-muted-foreground">Create your custom design</p>
          </div>
          <div className="lg:hidden flex justify-center">
            <img src="/icons/swatch.png" className="w-6 h-6 text-primary icon-hover gentle-pulse" alt="Color Swatch" />
          </div>
        </div>

        {/* Tools */}
        <div className="flex-1 p-2">
          <div className="space-y-1">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "premium" : "glass"}
                    size="sm"
                    onClick={() => onToolChange(tool.id)}
                    className="w-full justify-start h-12 lg:h-10"
                  >
                    {tool.id === "ai" ? (
                      <AIWandIcon className="lg:mr-3" size={16} />
                    ) : (
                      <tool.icon className="w-4 h-4 lg:mr-3 icon-hover" />
                    )}
                    <span className="hidden lg:inline">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Share & Help Section */}
        <div className="border-t border-border p-2 space-y-1">
          {/* Share Design */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="glass" 
                size="sm" 
                className="w-full justify-start h-12 lg:h-10"
                onClick={handleShareDesign}
              >
                <img src="/icons/share-design.png" className="w-5 h-5 lg:mr-3 icon-hover" alt="Share Design" />
                <span className="hidden lg:inline">Share Design</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Share Design
            </TooltipContent>
          </Tooltip>

          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="glass" 
                size="sm" 
                className="w-full justify-start h-12 lg:h-10"
                onClick={() => setIsHelpChatOpen(true)}
              >
                <img src="/icons/help.png" className="w-5 h-5 lg:mr-3 icon-hover" alt="Help" />
                <span className="hidden lg:inline">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Help & Tips
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Modals */}
        <HelpChatbot 
          isOpen={isHelpChatOpen} 
          onClose={() => setIsHelpChatOpen(false)} 
        />
        
        <ShareDesignModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            onShareModalChange?.(false);
          }}
          designName="My Design"
          designUrl={`${window.location.origin}?design=shared`}
        />

        <SaveDesignModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          designData={designData}
          productType={productType}
          productColor={productColor}
          previewImage={previewImage}
        />
      </div>
    </TooltipProvider>
  );
};