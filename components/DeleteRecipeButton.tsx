"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useAuth } from "@/components/AuthContext"
import { useModal } from "@/hooks/ui/useModal"
import { useRouter } from "next/navigation"
import { useSnackbar } from "@/components/ui/Snackbar"
import { useDeleteRecipe } from "@/hooks/mutations/useDeleteRecipe"

interface DeleteRecipeButtonProps {
    recipeId: string
    ownerId: string | undefined
}

export function DeleteRecipeButton({ recipeId, ownerId }: DeleteRecipeButtonProps) {
    const { profile } = useAuth()
    const router = useRouter()
    const deleteModal = useModal("delete-confirmation")
    const { showSnackbar } = useSnackbar()
    const { mutateAsync: deleteRecipe } = useDeleteRecipe(profile?.id)
    // Check if user is the owner
    // We need to check against the profile id that matches the firebase uid
    // But useAuth provides profile which should have the id.

    if (!profile || !ownerId) return null
    if (profile.id !== ownerId) return null

    const handleDelete = async () => {
        try {
            await deleteRecipe(recipeId)
            showSnackbar("Receta eliminada correctamente", "success")
            router.push("/recipes")
        } catch (error) {
            console.error("Error deleting recipe:", error)
            showSnackbar("Error al eliminar la receta", "error")
            throw error
        }
    }

    const openDeleteModal = () => {
        deleteModal.open({
            onConfirm: handleDelete,
            title: "¿Eliminar receta?",
            description: "¿Estás seguro de que quieres eliminar esta receta? Esta acción moverá la receta a la papelera."
        })
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-background/80 backdrop-blur-md [@media(hover:hover)]:hover:bg-background border-primary/20"
            onClick={openDeleteModal}
            title="Eliminar receta"
        >
            <Trash2 className="h-5 w-5 text-primary" />
            <span className="sr-only">Eliminar receta</span>
        </Button>
    )
}
