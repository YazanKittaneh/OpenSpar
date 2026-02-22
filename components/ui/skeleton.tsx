import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[var(--border)] animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
