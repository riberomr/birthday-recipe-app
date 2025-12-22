"use client"

import { useRecipe } from "@/hooks/queries/useRecipe"
import { RecipeForm } from "@/components/RecipeForm"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EditRecipeClientProps {
    id: string
}

export function EditRecipeClient({ id }: EditRecipeClientProps) {
    const router = useRouter()
    const { data: recipe, isLoading, isError } = useRecipe(id)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-pink-50 dark:bg-zinc-950 py-12 px-4 flex items-center justify-center">
                <div role="status" className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (isError || !recipe) {
        return (
            <div className="min-h-screen bg-pink-50 dark:bg-zinc-950 py-12 px-4 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Receta no encontrada 😢</h1>
                <Button onClick={() => router.push("/recipes")}>Volver a Recetas</Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-pink-50 dark:bg-zinc-950 py-12 px-4">
            <RecipeForm initialData={recipe} isEditing={true} />
        </div>
    )
}
