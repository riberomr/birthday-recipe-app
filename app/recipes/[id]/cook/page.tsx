import { getRecipe } from "@/lib/api/recipes"
import { CookingModeClient } from "@/components/CookingModeClient"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface CookingPageProps {
    params: Promise<{
        id: string
    }>
}
export default async function CookingPage({ params }: CookingPageProps) {
    const { id } = await params

    const recipe = await getRecipe(id)

    if (!recipe || !recipe.recipe_steps || recipe.recipe_steps.length === 0) {
        notFound()
    }

    return (
        <CookingModeClient
            steps={recipe.recipe_steps}
            recipeId={recipe.id}
            recipeTitle={recipe.title}
        />
    )
}
