import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Main AI Text - bold and prominent */}
      <div 
        className="font-black text-foreground"
        style={{ fontSize: size * 0.7, lineHeight: 1, letterSpacing: '-0.02em' }}
      >
        AI
      </div>
      
      {/* Large sparkle - top right */}
      <div className="absolute -top-1 -right-1 w-2 h-2 text-foreground animate-pulse">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 2px currentColor)' }}>
          <path d="M12 0l3 9h9l-7.5 5.5L19.5 24 12 18.5 4.5 24l3-9.5L0 9h9L12 0z" />
        </svg>
      </div>
      
      {/* Medium sparkle - top left */}
      <div className="absolute -top-0.5 -left-1.5 w-1.5 h-1.5 text-foreground animate-pulse delay-300">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 1px currentColor)' }}>
          <path d="M12 0l3 9h9l-7.5 5.5L19.5 24 12 18.5 4.5 24l3-9.5L0 9h9L12 0z" />
        </svg>
      </div>
      
      {/* Small sparkle - bottom right */}
      <div className="absolute -bottom-0.5 right-0 w-1 h-1 text-foreground animate-pulse delay-500">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 1px currentColor)' }}>
          <path d="M12 0l3 9h9l-7.5 5.5L19.5 24 12 18.5 4.5 24l3-9.5L0 9h9L12 0z" />
        </svg>
      </div>
    </div>
  );
};