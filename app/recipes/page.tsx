import { getRecipes, getCategories } from "@/lib/api/recipes"
import { RecipeListClient } from "@/components/RecipeListClient"

export const dynamic = "force-dynamic"

export default async function RecipesPage() {
    const [{ recipes, total }, categories] = await Promise.all([
        getRecipes(1, 6), // Initial fetch
        getCategories(),
    ])

    return (
        <div className="page-container p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-primary">Recetas</h1>
                </div>

                <RecipeListClient initialRecipes={recipes} initialTotal={total} categories={categories} />
            </div>
        </div>
    )
}
