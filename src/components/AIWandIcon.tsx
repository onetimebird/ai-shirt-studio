import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Magic Wand - larger */}
      <svg 
        viewBox="0 0 16 16" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        className="w-full h-full text-foreground"
      >
        {/* Wand stick */}
        <line x1="3" y1="13" x2="9" y2="7" />
        {/* Wand tip */}
        <circle cx="9" cy="7" r="1.5" fill="currentColor" />
      </svg>
      
      {/* AI Text - larger and positioned */}
      <div 
        className="absolute -bottom-1 -right-0.5 font-black text-foreground bg-background px-0.5 rounded text-center"
        style={{ fontSize: size * 0.4, lineHeight: 1 }}
      >
        AI
      </div>
      
      {/* Static sparkles - no effects */}
      <div className="absolute top-0 right-0 w-1 h-1 text-foreground">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      <div className="absolute top-2 left-1 w-0.5 h-0.5 text-foreground">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 w-0.5 h-0.5 text-foreground">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
    </div>
  );
};