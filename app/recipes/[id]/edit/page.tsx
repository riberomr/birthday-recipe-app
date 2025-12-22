import { EditRecipeClient } from "../../../../components/EditRecipeClient"

interface EditRecipePageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
    const { id } = await params

    return <EditRecipeClient id={id} />
}
