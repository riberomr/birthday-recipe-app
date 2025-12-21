import { RecipeDetailClient } from "@/components/RecipeDetailClient"

interface RecipePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function RecipePage({ params }: RecipePageProps) {
    const { id } = await params

    return <RecipeDetailClient id={id} />
}
