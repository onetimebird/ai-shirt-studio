import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Main AI Text - large and bold */}
      <div 
        className="font-black text-foreground relative"
        style={{ fontSize: size * 0.75, lineHeight: 1, letterSpacing: '-0.05em' }}
      >
        AI
      </div>
      
      {/* Diagonal wand line through AI */}
      <div 
        className="absolute bg-foreground"
        style={{
          width: size * 0.6,
          height: size * 0.12,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(35deg)',
          borderRadius: size * 0.06
        }}
      />
      
      {/* Large sparkle - top right */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.25, 
          height: size * 0.25,
          top: size * -0.1,
          right: size * -0.1
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0C12 0 14.5 8.5 14.5 12C14.5 15.5 12 24 12 24C12 24 9.5 15.5 9.5 12C9.5 8.5 12 0 12 0ZM0 12C0 12 8.5 9.5 12 9.5C15.5 9.5 24 12 24 12C24 12 15.5 14.5 12 14.5C8.5 14.5 0 12 0 12Z" />
        </svg>
      </div>
      
      {/* Medium sparkle - top left */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.18, 
          height: size * 0.18,
          top: size * 0.05,
          left: size * -0.05
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0C12 0 14.5 8.5 14.5 12C14.5 15.5 12 24 12 24C12 24 9.5 15.5 9.5 12C9.5 8.5 12 0 12 0ZM0 12C0 12 8.5 9.5 12 9.5C15.5 9.5 24 12 24 12C24 12 15.5 14.5 12 14.5C8.5 14.5 0 12 0 12Z" />
        </svg>
      </div>
      
      {/* Small sparkle - bottom right */}
      <div 
        className="absolute text-foreground"
        style={{ 
          width: size * 0.15, 
          height: size * 0.15,
          bottom: size * 0.05,
          right: size * 0.1
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 0C12 0 14.5 8.5 14.5 12C14.5 15.5 12 24 12 24C12 24 9.5 15.5 9.5 12C9.5 8.5 12 0 12 0ZM0 12C0 12 8.5 9.5 12 9.5C15.5 9.5 24 12 24 12C24 12 15.5 14.5 12 14.5C8.5 14.5 0 12 0 12Z" />
        </svg>
      </div>
    </div>
  );
};