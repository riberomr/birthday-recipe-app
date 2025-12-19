"use client"

import { useAuth } from "@/components/AuthContext"
import { StarRating } from "./StarRating"

interface RatingSectionProps {
    recipeId: string
}

export function RatingSection({ recipeId }: RatingSectionProps) {
    const { user } = useAuth()


    return (
        <>
            {user && (<div className="flex sm:items-start gap-4 mb-6 sm:flex-row flex-col justify-between">
                <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                    Calificar Receta
                </h3>
                <StarRating recipeId={recipeId} size="lg" />
            </div>)}
        </>
    )
}
