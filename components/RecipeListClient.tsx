"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Recipe, RecipeCategory } from "@/types"
import { FilterBar } from "@/components/FilterBar"
import { RecipeCard } from "@/components/RecipeCard"
import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton"
import { motion } from "framer-motion"
import { getRecipes, RecipeFilters } from "@/lib/api/recipes"
import { useInView } from "framer-motion"

interface RecipeListClientProps {
    initialRecipes: Recipe[]
    initialTotal: number
    categories: RecipeCategory[]
}

export function RecipeListClient({ initialRecipes, initialTotal, categories }: RecipeListClientProps) {
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
    const [total, setTotal] = useState(initialTotal)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialRecipes.length < initialTotal)

    // Filters state
    const [filters, setFilters] = useState<RecipeFilters>({
        search: "",
        category: "",
        difficulty: "",
        time: "",
        tags: []
    })

    // Reset when filters change
    useEffect(() => {
        const fetchFilteredRecipes = async () => {
            setLoading(true)
            setPage(1)
            try {
                const { recipes: newRecipes, total: newTotal } = await getRecipes(1, 6, filters)
                setRecipes(newRecipes)
                setTotal(newTotal)
                setHasMore(newRecipes.length < newTotal)
            } catch (error) {
                console.error("Error filtering recipes:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFilteredRecipes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    const loadMore = async () => {
        if (loading || !hasMore) return

        setLoading(true)
        const nextPage = page + 1
        try {
            const { recipes: newRecipes, total: newTotal } = await getRecipes(nextPage, 6, filters)
            setRecipes(prev => [...prev, ...newRecipes])
            setPage(nextPage)
            setHasMore(recipes.length + newRecipes.length < newTotal)
        } catch (error) {
            console.error("Error loading more recipes:", error)
        } finally {
            setLoading(false)
        }
    }

    // Intersection Observer for infinite scroll
    const loaderRef = useRef(null)
    const isInView = useInView(loaderRef)

    useEffect(() => {
        if (isInView && hasMore && !loading) {
            loadMore()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInView, hasMore, loading])

    return (
        <div className="space-y-6">
            <FilterBar categories={categories} onFilterChange={(newFilters: any) => setFilters(prev => ({ ...prev, ...newFilters }))} />

            {recipes.length === 0 && !loading ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No se encontraron recetas 🍰</p>
                    <p className="text-sm">Intenta con otra búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe, index) => (
                        <motion.div
                            key={`${recipe.id}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index % 6 * 0.1 }}
                        >
                            <RecipeCard recipe={recipe} />
                        </motion.div>
                    ))}

                    {loading && (
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
                {hasMore && !loading && (
                    <button onClick={loadMore} className="text-sm text-pink-500 hover:underline">
                        Cargar más
                    </button>
                )}
            </div>
        </div>
    )
}
