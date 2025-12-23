import { CookingModeClient } from "@/components/CookingModeClient"

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
