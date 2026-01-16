"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthContext"
import { useModal } from "@/hooks/ui/useModal"
import { useRouter } from "next/navigation"
import { useSnackbar } from "@/components/ui/Snackbar"
import { useDeleteRecipe } from "@/hooks/mutations/useDeleteRecipe"

interface RecipeActionsMenuProps {
    recipeId: string
    ownerId: string
    title: string
}

export function RecipeActionsMenu({ recipeId, ownerId, title }: RecipeActionsMenuProps) {
    const { profile } = useAuth()
    const router = useRouter()
    const deleteModal = useModal("delete-confirmation")
    const { showSnackbar } = useSnackbar()
    const { mutateAsync: deleteRecipe } = useDeleteRecipe(profile?.id)

    // Check if user is the owner
    if (!profile || profile.id !== ownerId) return null

    const handleDelete = async () => {
        try {
            await deleteRecipe(recipeId)
            showSnackbar("Receta eliminada correctamente", "success")
            router.push("/recipes")
        } catch (error) {
            console.error("Error deleting recipe:", error)
            showSnackbar("Error al eliminar la receta", "error")
        }
    }

    const openDeleteModal = () => {
        deleteModal.open({
            onConfirm: handleDelete,
            title: "¿Eliminar receta?",
            description: `¿Estás seguro de que quieres eliminar la receta "${title}"? Esta acción no se puede deshacer.`
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 text-primary hover:bg-primary/10">
                    <MoreVertical className="h-5 w-5" />
                    <span className="sr-only">Opciones de receta</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <Link href={`/recipes/${recipeId}/edit`}>
                    <DropdownMenuItem className="cursor-pointer py-3">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar Receta</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 py-3"
                    onClick={openDeleteModal}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar Receta</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
