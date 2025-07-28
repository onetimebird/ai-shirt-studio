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
  HelpCircle
} from "lucide-react";

interface LeftToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
}

const tools = [
  { id: "upload", label: "Upload Image", icon: Upload },
  { id: "text", label: "Add Text", icon: Type },
  { id: "ai", label: "AI Image Generator", icon: Wand2 },
  { id: "products", label: "Change Product", icon: Shirt },
  { id: "color", label: "Change Color", icon: Palette },
  { id: "reset", label: "Reset Design", icon: RotateCcw },
];

export const LeftToolbar = ({ activeTool, onToolChange }: LeftToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="w-16 lg:w-64 bg-card border-r border-border flex flex-col shadow-soft">
        {/* Logo/Brand */}
        <div className="p-4 border-b border-border">
          <div className="hidden lg:block">
            <h2 className="font-semibold text-lg">Design Studio</h2>
            <p className="text-xs text-muted-foreground">Create your custom design</p>
          </div>
          <div className="lg:hidden flex justify-center">
            <Palette className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Tools */}
        <div className="flex-1 p-2">
          <div className="space-y-1">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTool === tool.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onToolChange(tool.id)}
                    className="w-full justify-start h-12 lg:h-10"
                  >
                    <tool.icon className="w-4 h-4 lg:mr-3" />
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

        {/* Help Section */}
        <div className="border-t border-border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start h-12 lg:h-10">
                <HelpCircle className="w-4 h-4 lg:mr-3" />
                <span className="hidden lg:inline">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="lg:hidden">
              Help & Tips
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};