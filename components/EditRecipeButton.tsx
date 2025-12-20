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
    const { profile } = useAuth()

    if (!profile || profile.id !== ownerId) {
        return null
    }

    return (
        <Link href={`/recipes/${recipeId}/edit`}>
            <Button variant="outline" size="icon" className="rounded-full bg-background/80 backdrop-blur-md [@media(hover:hover)]:hover:bg-background border-primary/20">
                <Edit className="h-5 w-5 text-primary" />
                <span className="sr-only">Editar receta</span>
            </Button>
        </Link>
    )
}
