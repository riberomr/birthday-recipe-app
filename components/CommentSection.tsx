"use client"

import { useComments } from "@/hooks/queries/useComments"
import { CommentList } from "./CommentList"
import { CommentForm } from "./CommentForm"

interface CommentSectionProps {
    recipeId: string
    recipeOwnerId: string
}

export function CommentSection({ recipeId, recipeOwnerId }: CommentSectionProps) {
    // We fetch the total count here to display in the header, 
    // although CommentList also fetches it. 
    // Since useComments uses React Query, the data will be cached and shared.
    // We only need the count here.
    const { data } = useComments(recipeId, 1, 5)
    const total = data?.total || 0

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">Comentarios ({total})</h3>
            <CommentForm recipeId={recipeId} />
            <CommentList recipeId={recipeId} recipeOwnerId={recipeOwnerId} />
        </div>
    )
}
