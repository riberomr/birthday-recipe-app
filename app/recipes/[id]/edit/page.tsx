import { getRecipe } from "@/lib/api/recipes"
import { RecipeForm } from "@/components/RecipeForm"
import { notFound } from "next/navigation"

interface EditRecipePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
    const { id } = await params
    const recipe = await getRecipe(id)

    if (!recipe) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-pink-50 dark:bg-zinc-950 py-12 px-4">
            <RecipeForm initialData={recipe} isEditing={true} />
        </div>
    )
}
