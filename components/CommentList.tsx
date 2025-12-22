"use client"

import { useState } from "react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { useComments } from "@/hooks/queries/useComments"
import { useDeleteComment } from "@/hooks/mutations/useDeleteComment"
import { Trash2 } from "lucide-react"
import { useSnackbar } from "@/components/ui/Snackbar"
import { CommentSkeleton } from "@/components/CommentSkeleton"
import { useModal } from "@/hooks/ui/useModal"
import { Comment } from "@/types"

interface CommentListProps {
    recipeId: string
    recipeOwnerId: string
}

export function CommentList({ recipeId, recipeOwnerId }: CommentListProps) {
    const { profile: user } = useAuth()
    const { showSnackbar } = useSnackbar()

    // We fetch 5 comments per page. 
    // Note: The current useComments hook fetches a specific page. 
    // To implement "Load More", we might need to fetch all pages up to current, 
    // or use infinite query. For now, let's stick to simple pagination or just fetch more.
    // Actually, the previous implementation appended comments.
    // With useQuery, we get the data for the current key.
    // If we want to append, we should probably use useInfiniteQuery.
    // But the user didn't explicitly ask for infinite query, just "refactor".
    // However, "Load More" implies appending.
    // If I change page, useQuery will fetch new data and replace the old one unless I keep previous data.
    // For simplicity and to match previous behavior, I'll use a simple list for now, 
    // but maybe I should have implemented useInfiniteQuery.
    // Given the constraints and the "quick" migration, I'll try to replicate the "Load More" 
    // by fetching a larger limit or using keepPreviousData (placeholderData).
    // Or, I can just fetch all comments up to page * 5.
    // Let's modify useComments to accept limit and we increase limit?
    // Or just use pagination.
    // The previous code: `setComments(prev => [...prev, ...newComments])`.
    // I'll stick to pagination for now (replace list), or if I want "Load More", I should use useInfiniteQuery.
    // The user said: "Modifica el componente CommentList.tsx para usar el hook de lectura."
    // I'll use useQuery with a limit that increases?
    // `useComments(recipeId, 1, page * 5)`?
    // That would re-fetch everything when page increases. That's fine for now.

    const [limit, setLimit] = useState(5)

    const { data, isLoading, error } = useComments(recipeId, 1, limit)
    const comments = data?.comments || []
    const total = data?.total || 0

    const { mutateAsync: deleteComment } = useDeleteComment(recipeId)
    const { open: openDeleteModal, close: closeDeleteModal } = useModal('delete-confirmation')

    const handleDeleteComment = (commentId: string) => {
        openDeleteModal({
            title: "¿Eliminar comentario?",
            description: "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                try {
                    await deleteComment(commentId)
                    showSnackbar("Comentario eliminado", "success")
                    closeDeleteModal()
                } catch (error: any) {
                    showSnackbar(error.message || "Error al eliminar comentario", "error")
                }
            }

        })
    }

    const loadMoreComments = () => {
        setLimit(prev => prev + 5)
    }

    if (isLoading && limit === 5) {
        return (
            <div className="space-y-4 mt-8">
                <CommentSkeleton />
                <CommentSkeleton />
                <CommentSkeleton />
            </div>
        )
    }

    if (error) {
        return <p className="text-center text-red-500 py-8">Error al cargar comentarios.</p>
    }

    if (comments.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No hay comentarios aún. ¡Sé el primero!</p>
    }

    return (
        <div className="space-y-4 mt-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment: Comment) => (
                <div key={comment.id} className="flex gap-4 p-4 bg-card rounded-xl border border-primary/10 dark:border-primary/20 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={comment.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={comment.profiles?.full_name || 'User'}
                        className="w-10 h-10 rounded-full border border-primary/10 shrink-0"
                    />
                    <div className="flex-1">
                        <div className="flex justify-between items-left gap-2 mb-2">
                            <div className="flex flex-col items-left">
                                <span className="font-bold text-foreground">
                                    {comment.profiles?.full_name || 'Usuario'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {user && (user.id === comment.user_id || user.id === recipeOwnerId) && (
                                <div className="flex items-right gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 ml-2"
                                        onClick={() => handleDeleteComment(comment.id)}
                                        aria-label="Eliminar comentario"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-start">
                            <p className="text-muted-foreground whitespace-pre-wrap flex-1">{comment.content}</p>

                        </div>
                        {comment.image_url && (
                            <div className="mt-3">
                                <img
                                    src={comment.image_url}
                                    alt="Foto del comentario"
                                    className="max-h-64 rounded-lg border border-primary/10 object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {comments.length < total && (
                <div className="flex justify-center pt-2 pb-4">
                    <Button
                        variant="outline"
                        onClick={loadMoreComments}
                        disabled={isLoading}
                        className="text-primary border-primary/20 [@media(hover:hover)]:hover:bg-primary/10"
                    >
                        {isLoading ? "Cargando..." : "Cargar más comentarios"}
                    </Button>
                </div>
            )}
        </div>
    )
}
