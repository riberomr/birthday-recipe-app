"use client"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface DisplayRatingProps {
    rating: number
    count?: number
    size?: "sm" | "md" | "lg"
    className?: string
    showCount?: boolean
}

export function DisplayRating({
    rating,
    count,
    size = "md",
    className,
    showCount = true
}: DisplayRatingProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8"
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex gap-1 bg-transparent">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                    const fillPercentage = Math.max(0, Math.min(100, (rating - (starIndex - 1)) * 100));

                    return (
                        <div key={starIndex} className="relative">
                            {/* Background Star (Empty) */}
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "text-muted-foreground/30"
                                )}
                            />

                            {/* Foreground Star (Filled & Clipped) */}
                            <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className={cn(
                                        sizeClasses[size],
                                        "fill-yellow-400 text-yellow-400"
                                    )}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            {showCount && count !== undefined && (
                <span className="text-xs text-muted-foreground">
                    {rating.toFixed(1)} ({count})
                </span>
            )}
        </div>
    )
}
