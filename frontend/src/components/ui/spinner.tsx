import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "border-amber-500/30 border-t-amber-500 rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  )
}

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-amber-500/10 rounded",
        className
      )}
    />
  )
}

export function SkeletonRow({ className }: { className?: string }) {
  return <div className={cn("h-10 animate-pulse bg-amber-500/10 rounded", className)} />
}

export function TicketSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-1/6" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} className="h-14" />
      ))}
    </div>
  )
}