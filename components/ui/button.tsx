import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold tracking-wide uppercase transition-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-[#FF4500] focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-[#FF4500] hover:text-white",
        destructive: "bg-[#FF4500] text-white hover:bg-foreground hover:text-background",
        outline: "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary: "border border-border bg-transparent text-foreground hover:border-foreground",
        ghost: "bg-transparent text-foreground hover:bg-foreground hover:text-background",
        link: "text-foreground underline-offset-4 hover:underline uppercase tracking-[0.05em] font-mono text-xs",
      },
      size: {
        default: "h-10 px-6 py-3",
        xs: "h-6 gap-1 px-3 text-[10px]",
        sm: "h-8 gap-1.5 px-4 text-xs",
        lg: "h-12 px-8 text-sm",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
