import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Main AI Text - much bigger and centered */}
      <div 
        className="font-black text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
        style={{ fontSize: size * 0.8, lineHeight: 1 }}
      >
        AI
      </div>
      
      {/* Decorative sparkles around AI */}
      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 text-primary/70">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      <div className="absolute -top-0.5 -left-1 w-1 h-1 text-primary/50">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      <div className="absolute -bottom-1 -left-0.5 w-1 h-1 text-primary/60">
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
    </div>
  );
};