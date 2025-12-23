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


    return (
        <CookingModeClient
            recipeId={id}
        />
    )
}
