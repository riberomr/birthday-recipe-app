"use client"

import { useState, useEffect, useRef } from "react"
import { Recipe, RecipeCategory } from "@/types"
import { FilterBar } from "@/components/FilterBar"
import { RecipeCard } from "@/components/RecipeCard"
import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton"
import { motion } from "framer-motion"
import { RecipeFilters } from "@/lib/api/recipes"
import { useInView } from "framer-motion"
import { useRecipes } from "@/hooks/queries/useRecipes"
import { useCategories } from "@/hooks/queries/useCategories"

export function RecipeListClient() {
    // Filters state
    const { data: categories } = useCategories()


    const [filters, setFilters] = useState<RecipeFilters>({
        search: "",
        category: "",
        difficulty: "",
        time: "",
        tags: [],
        user_id: ""
    })

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useRecipes(filters)

    // Intersection Observer for infinite scroll
    const loaderRef = useRef(null)
    const isInView = useInView(loaderRef)

    useEffect(() => {
        if (isInView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [isInView, hasNextPage, isFetchingNextPage, fetchNextPage])

    // Flatten pages into a single array of recipes
    const recipes = data ? data.pages.flatMap(page => page.recipes) : []
    // Use initial data if query is loading initially (though useRecipes handles this if we passed initialData, 
    // but here we are just falling back to props if data is undefined which happens on first render if not hydrated)
    // Actually, to properly use initial data with useInfiniteQuery we would need to pass it to the hook.
    // For now, let's rely on the hook fetching. If we want to use initialRecipes as placeholder, we can do:
    // But since filters might change, initialRecipes are only valid for empty filters.

    // Let's just use the data from the hook. If it's loading and we have no data, show skeletons.
    // If we want to show initialRecipes while loading, we can check if filters are empty.
    const showInitial = !data && isLoading && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))
    const displayRecipes = showInitial ? [] : recipes

    return (
        <div className="space-y-6">
            <FilterBar categories={categories || []} onFilterChange={(newFilters: any) => setFilters(prev => ({ ...prev, ...newFilters }))} />

            {displayRecipes.length === 0 && !isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">No se encontraron recetas 🍰</p>
                    <p className="text-sm">Intenta con otra búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayRecipes.map((recipe, index) => (
                        <motion.div
                            key={`${recipe.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index % 6 * 0.1 }}
                        >
                            <RecipeCard recipe={recipe} />
                        </motion.div>
                    ))}

                    {(isLoading || isFetchingNextPage) && (
                        <>
                            <RecipeCardSkeleton />
                            <RecipeCardSkeleton />
                            <RecipeCardSkeleton />
                        </>
                    )}
                </div>
            )}

            {/* Loader element for intersection observer */}
            <div ref={loaderRef} className="h-10 w-full flex justify-center items-center">
                {hasNextPage && !isFetchingNextPage && (
                    <button onClick={() => fetchNextPage()} className="text-sm text-primary [@media(hover:hover)]:hover:underline">
                        Cargar más
                    </button>
                )}
            </div>
        </div>
    )
}
