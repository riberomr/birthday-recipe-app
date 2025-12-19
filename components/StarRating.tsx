"use client"
import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { getUserRating, upsertRating } from "@/lib/api/ratings"
import { useAuth } from "./AuthContext"

interface StarRatingProps {
    recipeId?: string
    rating?: number
    onRatingChange?: (rating: number) => void
    readonly?: boolean
    size?: "sm" | "md" | "lg"
}

export function StarRating({
    recipeId,
    rating: initialRating = 0,
    onRatingChange,
    readonly = false,
    size = "md"
}: StarRatingProps) {
    const [rating, setRating] = useState(initialRating)
    const [hoverRating, setHoverRating] = useState(0)
    const { supabaseUser } = useAuth()

    useEffect(() => {
        if (recipeId && supabaseUser && !readonly) {
            fetchUserRating()
        }
    }, [recipeId, supabaseUser])

    const fetchUserRating = async () => {
        if (!recipeId || !supabaseUser) return

        try {
            const userRating = await getUserRating(supabaseUser.id, recipeId)
            setRating(userRating)
        } catch (error) {
            console.error("Error fetching rating:", error)
        }
    }

    const handleRatingClick = async (newRating: number) => {
        if (readonly || !supabaseUser || !recipeId) return

        // Optimistic update
        const previousRating = rating
        setRating(newRating)

        try {
            await upsertRating(supabaseUser.id, recipeId, newRating)
            onRatingChange?.(newRating)
        } catch (error) {
            console.error("Error saving rating:", error)
            // Revert on error
            setRating(previousRating)
        }
    }

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8"
    }

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly || !supabaseUser}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => !readonly && supabaseUser && setHoverRating(star)}
                    onMouseLeave={() => !readonly && supabaseUser && setHoverRating(0)}
                    className={cn(
                        "transition-all duration-200 focus:outline-none",
                        readonly || !supabaseUser ? "cursor-default" : "cursor-pointer [@media(hover:hover)]:hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
