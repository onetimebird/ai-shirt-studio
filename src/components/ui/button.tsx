import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:shadow-elevated transform hover:scale-105 shimmer-hover glow-effect",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow transform hover:scale-105",
        outline:
          "border border-input bg-gradient-glass backdrop-blur-sm hover:bg-gradient-card hover:text-accent-foreground hover:shadow-glass transform hover:scale-105",
        secondary:
          "bg-gradient-card text-secondary-foreground hover:shadow-soft transform hover:scale-105 shimmer-hover",
        ghost: "hover:bg-gradient-glass hover:text-accent-foreground transform hover:scale-105 icon-hover",
        link: "text-primary underline-offset-4 hover:underline transform hover:scale-105",
        hero: "bg-gradient-aurora text-primary-foreground hover:shadow-elevated transform hover:scale-110 font-semibold shimmer-hover glow-effect",
        creative: "bg-gradient-premium text-primary-foreground hover:shadow-creative transform hover:-translate-y-2 hover:scale-105 shimmer-hover glow-effect",
        glass: "glass-effect text-foreground hover:shadow-glass transform hover:scale-105 backdrop-blur-xl",
        premium: "bg-gradient-aurora text-primary-foreground hover:shadow-elevated transform hover:scale-110 shimmer-hover glow-effect",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
