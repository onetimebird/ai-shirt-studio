import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Magic Wand */}
      <svg 
        viewBox="0 0 16 16" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
        className="w-full h-full text-foreground"
      >
        {/* Wand stick */}
        <line x1="2" y1="14" x2="10" y2="6" />
        {/* Wand tip */}
        <circle cx="10" cy="6" r="1.5" fill="currentColor" />
      </svg>
      
      {/* AI Text overlay with subtle glow */}
      <div 
        className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[6px] font-bold px-1 py-0.5 rounded leading-none shadow-sm"
        style={{ fontSize: size * 0.25 }}
      >
        AI
      </div>
      
      {/* Subtle magic effect - just two small dots */}
      <div className="absolute top-1 left-3 w-0.5 h-0.5 bg-primary/60 rounded-full animate-pulse"></div>
      <div className="absolute top-3 right-1 w-1 h-1 bg-primary/40 rounded-full animate-pulse delay-700"></div>
    </div>
  );
};