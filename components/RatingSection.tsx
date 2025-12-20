"use client"

import { useAuth } from "@/components/AuthContext"
import { StarRating } from "./StarRating"
import { useRecipeRating } from "@/hooks/queries/useRecipeRating"
import { Star } from "lucide-react"

interface RatingSectionProps {
    recipeId: string
}

export function RatingSection({ recipeId }: RatingSectionProps) {
    const { profile } = useAuth()
    const { data } = useRecipeRating(recipeId)
    const average = data?.average || 0
    const count = data?.count || 0

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{average.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                    ({count} {count === 1 ? 'voto' : 'votos'})
                </span>
            </div>

            {profile && (
                <div className="flex sm:items-center gap-4 sm:flex-row flex-col justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div>
                        <h3 className="font-bold text-primary">
                            Calificar Receta
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            ¿Qué te pareció esta receta?
                        </p>
                    </div>
                    <StarRating recipeId={recipeId} size="lg" />
                </div>
            )}
        </div>
    )
}
