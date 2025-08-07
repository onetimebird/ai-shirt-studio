import { cn } from "@/lib/utils";

interface AIIconProps {
  className?: string;
  size?: number;
}

export const AIIcon = ({ className, size = 16 }: AIIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Sparkles */}
      <div className="absolute -top-1 -left-1 w-2 h-2 text-primary opacity-80">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
      
      {/* Main AI text */}
      <div 
        className="font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
        style={{ fontSize: size * 0.6, lineHeight: 1 }}
      >
        AI
      </div>
      
      {/* Bottom sparkle */}
      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 text-primary/60">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse delay-150">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
      
      {/* Right sparkle */}
      <div className="absolute -top-0.5 -right-0.5 w-1 h-1 text-primary/50">
        <svg viewBox="0 0 8 8" fill="currentColor" className="w-full h-full animate-pulse delay-300">
          <path d="M4 0l1 3h3l-2.5 2L6.5 8 4 6 1.5 8 2.5 5 0 3h3L4 0z" />
        </svg>
      </div>
    </div>
  );
};