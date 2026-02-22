import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground border border-[var(--border)] bg-transparent px-4 py-3 text-sm text-foreground outline-none transition-none w-full min-h-16 resize-y",
        "focus-visible:border-[#FF4500]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
