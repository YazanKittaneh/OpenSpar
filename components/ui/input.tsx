import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-muted-foreground border-b border-t-0 border-l-0 border-r-0 border-[var(--border)] bg-transparent px-0 py-2 text-sm text-foreground outline-none transition-none w-full",
        "focus-visible:border-b-[#FF4500] focus-visible:border-b-2",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
