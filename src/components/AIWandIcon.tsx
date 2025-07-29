import { cn } from "@/lib/utils";

interface AIWandIconProps {
  className?: string;
  size?: number;
}

export const AIWandIcon = ({ className, size = 16 }: AIWandIconProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* AI Text */}
      <div 
        className="font-black text-foreground relative"
        style={{ fontSize: size * 0.65, lineHeight: 1, letterSpacing: '-0.02em' }}
      >
        AI
        {/* Diagonal line through AI */}
        <div 
          className="absolute bg-foreground rounded-full"
          style={{
            width: size * 0.8,
            height: size * 0.08,
            top: '45%',
            left: '10%',
            transform: 'rotate(25deg)',
            transformOrigin: 'center'
          }}
        />
      </div>
    </div>
  );
};