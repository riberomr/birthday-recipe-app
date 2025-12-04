"use client"

import { useState, useMemo } from "react"
import { Recipe, RecipeCategory } from "@/types"
import { FilterBar } from "@/components/FilterBar"
import { RecipeCard } from "@/components/RecipeCard"
import { motion } from "framer-motion"

interface RecipeListClientProps {
    initialRecipes: Recipe[]
    categories: RecipeCategory[]
}

export function RecipeListClient({ initialRecipes, categories }: RecipeListClientProps) {
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        difficulty: "",
        time: "",
        tags: [] as string[]
    })

    const filteredRecipes = useMemo(() => {
        return initialRecipes.filter((recipe) => {
            // Category Filter
            const matchesCategory = filters.category
                ? recipe.category_id === filters.category
                : true

            // Search Filter
            const searchLower = filters.search.toLowerCase()
            const matchesSearch =
                recipe.title.toLowerCase().includes(searchLower) ||
                recipe.description?.toLowerCase().includes(searchLower) ||
                recipe.recipe_ingredients?.some((ing) =>
                    ing.name.toLowerCase().includes(searchLower)
                )

            // Difficulty Filter
            const matchesDifficulty = filters.difficulty
                ? recipe.difficulty === filters.difficulty
                : true

            // Time Filter
            let matchesTime = true
            const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
            if (filters.time === "fast") matchesTime = totalTime < 20
            if (filters.time === "medium") matchesTime = totalTime >= 20 && totalTime <= 60
            if (filters.time === "slow") matchesTime = totalTime > 60

            // Tags Filter
            const matchesTags = filters.tags.length > 0
                ? filters.tags.every(tagId =>
                    // @ts-ignore - recipe_tags might be joined differently or need type update
                    recipe.recipe_tags?.some((rt: any) => rt.tags.id === tagId)
                )
                : true

            return matchesCategory && matchesSearch && matchesDifficulty && matchesTime && matchesTags
        })
    }, [initialRecipes, filters])

    return (
        <div className="space-y-6">
            <FilterBar categories={categories} onFilterChange={setFilters} />

            {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No se encontraron recetas 🍰</p>
                    <p className="text-sm">Intenta con otra búsqueda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <RecipeCard recipe={recipe} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
