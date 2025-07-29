import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Square outline */}
      <div 
        className="border-2 border-foreground rounded-md flex items-center justify-center"
        style={{ 
          width: size * 0.8, 
          height: size * 0.8 
        }}
      >
        {/* AI Text */}
        <div 
          className="font-black text-foreground"
          style={{ fontSize: size * 0.4, lineHeight: 1 }}
        >
          AI
        </div>
      </div>
      
      {/* Top left sparkle */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.12, 
          height: size * 0.12,
          top: 0,
          left: 0
        }}
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      {/* Top right sparkle */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.1, 
          height: size * 0.1,
          top: size * 0.05,
          right: 0
        }}
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
      
      {/* Bottom right sparkle */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.08, 
          height: size * 0.08,
          bottom: 0,
          right: size * 0.05
        }}
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-full h-full">
          <path d="M6 0l1.5 4.5L12 6l-4.5 1.5L6 12l-1.5-4.5L0 6l4.5-1.5L6 0z" />
        </svg>
      </div>
    </div>
  );
};