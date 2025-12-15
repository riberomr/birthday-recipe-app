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
    const { user } = useAuth()

    useEffect(() => {
        if (recipeId && user && !readonly) {
            fetchUserRating()
        }
    }, [recipeId, user])

    const fetchUserRating = async () => {
        if (!recipeId || !user) return

        try {
            const userRating = await getUserRating(user.uid, recipeId)
            setRating(userRating)
        } catch (error) {
            console.error("Error fetching rating:", error)
        }
    }

    const handleRatingClick = async (newRating: number) => {
        if (readonly || !user || !recipeId) return

        // Optimistic update
        const previousRating = rating
        setRating(newRating)

        try {
            await upsertRating(user.uid, recipeId, newRating)
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
                    disabled={readonly || !user}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => !readonly && user && setHoverRating(star)}
                    onMouseLeave={() => !readonly && user && setHoverRating(0)}
                    className={cn(
                        "transition-all duration-200 focus:outline-none",
                        readonly || !user ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            (hoverRating || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
