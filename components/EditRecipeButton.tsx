"use client"

import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

interface EditRecipeButtonProps {
    recipeId: string
    ownerId: string
}

export function EditRecipeButton({ recipeId, ownerId }: EditRecipeButtonProps) {
    const { supabaseUser } = useAuth()

    if (!supabaseUser || supabaseUser.id !== ownerId) {
        return null
    }

    return (
        <Link href={`/recipes/${recipeId}/edit`}>
            <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 border-pink-200 dark:border-pink-900">
                <Edit className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                <span className="sr-only">Editar receta</span>
            </Button>
        </Link>
    )
}
