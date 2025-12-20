"use client"
import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./AuthContext"
import { useUserRating } from "@/hooks/queries/useUserRating"
import { useRateRecipe } from "@/hooks/mutations/useRateRecipe"
import { useSnackbar } from "@/components/ui/Snackbar"

interface StarRatingProps {
    recipeId: string
    readonly?: boolean
    size?: "sm" | "md" | "lg"
    onRatingChange?: (rating: number) => void
}

export function StarRating({
    recipeId,
    readonly = false,
    size = "md",
    onRatingChange
}: StarRatingProps) {
    const { supabaseUser } = useAuth()
    const { showSnackbar } = useSnackbar()
    const [hoverRating, setHoverRating] = useState(0)

    const { data: userRating } = useUserRating(recipeId, supabaseUser?.id)
    const { mutate: rateRecipe, isPending } = useRateRecipe()

    const currentRating = userRating || 0

    const handleRatingClick = (newRating: number) => {
        if (readonly || !supabaseUser || isPending) return

        rateRecipe({ recipeId, rating: newRating }, {
            onSuccess: () => {
                onRatingChange?.(newRating)
                showSnackbar("¡Calificación guardada!", "success")
            },
            onError: (error: any) => {
                showSnackbar(error.message || "Error al guardar calificación", "error")
            }
        })
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
                    disabled={readonly || !supabaseUser || isPending}
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => !readonly && supabaseUser && setHoverRating(star)}
                    onMouseLeave={() => !readonly && supabaseUser && setHoverRating(0)}
                    className={cn(
                        "transition-all duration-200 focus:outline-none",
                        readonly || !supabaseUser ? "cursor-default" : "cursor-pointer [@media(hover:hover)]:hover:scale-110"
                    )}
                    aria-label={`Calificar con ${star} estrellas`}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            (hoverRating || currentRating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        )}
                    />
                </button>
            ))}
        </div>
    )
}
