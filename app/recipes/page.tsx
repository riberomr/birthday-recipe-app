import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getRecipes, getCategories } from "@/lib/getRecipes"
import { RecipeListClient } from "@/components/RecipeListClient"

export const dynamic = "force-dynamic"

export default async function RecipesPage() {
    const [recipes, categories] = await Promise.all([
        getRecipes(),
        getCategories(),
    ])

    return (
        <div className="min-h-screen p-4 bg-pink-50 dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">Recetas</h1>
                </div>

                <RecipeListClient initialRecipes={recipes} categories={categories} />
            </div>
        </div>
    )
}
