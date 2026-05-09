import * as React from "react"
import { cn } from "@/lib/utils"

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded border border-amber-500/30 bg-[oklch(0.08_0_0)] px-3 py-1.5 font-mono text-sm text-amber-400 transition-all duration-200 outline-none cursor-pointer",
        "focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20",
        "hover:border-amber-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none bg-[length:12px] bg-no-repeat bg-[right_8px_center]",
        "[background-image:url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27%23f59e0b%27 d=%27M2 4l4 4 4-4%27/%3E%3C/svg%3E')]",
        className
      )}
      {...props}
    />
  )
}

export { Select }