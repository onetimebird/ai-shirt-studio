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
      
      {/* AI Text overlay */}
      <div 
        className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[6px] font-bold px-1 py-0.5 rounded leading-none"
        style={{ fontSize: size * 0.25 }}
      >
        AI
      </div>
      
      {/* Sparkles around wand */}
      <div className="absolute top-0 left-2 w-0.5 h-0.5 text-primary/40">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
      
      <div className="absolute top-2 right-0 w-0.5 h-0.5 text-primary/30">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse delay-150">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
      
      <div className="absolute bottom-1 left-0 w-0.5 h-0.5 text-primary/25">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse delay-300">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
    </div>
  );
};