"use client"

import { useState, useMemo } from "react"
import { Recipe, RecipeCategory } from "@/types"
import { SearchBar } from "@/components/SearchBar"
import { CategorySelect } from "@/components/CategorySelect"
import { RecipeCard } from "@/components/RecipeCard"
import { motion } from "framer-motion"

interface RecipeListClientProps {
    initialRecipes: Recipe[]
    categories: RecipeCategory[]
}

export function RecipeListClient({ initialRecipes, categories }: RecipeListClientProps) {
    const [search, setSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const filteredRecipes = useMemo(() => {
        return initialRecipes.filter((recipe) => {
            const matchesCategory = selectedCategory
                ? recipe.category_id === selectedCategory
                : true

            const searchLower = search.toLowerCase()
            const matchesSearch =
                recipe.title.toLowerCase().includes(searchLower) ||
                recipe.description?.toLowerCase().includes(searchLower) ||
                recipe.recipe_ingredients?.some((ing) =>
                    ing.name.toLowerCase().includes(searchLower)
                )

            return matchesCategory && matchesSearch
        })
    }, [initialRecipes, search, selectedCategory])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sticky top-0 z-10 bg-pink-50/95 dark:bg-zinc-950/95 backdrop-blur-sm p-4 -mx-4 sm:mx-0 rounded-b-xl border-b border-pink-100 dark:border-pink-900/50 shadow-sm">
                <div className="flex-1">
                    <SearchBar value={search} onChange={setSearch} />
                </div>
                <div className="w-full sm:w-48">
                    <CategorySelect
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>
            </div>

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
