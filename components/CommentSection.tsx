"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getComments, postComment, deleteComment } from "@/lib/api/comments"
import { Send, Camera, X, LogIn, Trash2 } from "lucide-react"
import { useSnackbar } from "@/components/ui/Snackbar"
import { compressImage } from "@/lib/utils"
import { CommentSkeleton } from "@/components/CommentSkeleton"
import { useModal } from "@/hooks/useModal"

type Comment = {
    id: string
    user_id: string
    content: string
    created_at: string
    profiles?: {
        full_name: string
        avatar_url: string
    }
}

interface CommentSectionProps {
    recipeId: string
    recipeOwnerId: string
}

export function CommentSection({ recipeId, recipeOwnerId }: CommentSectionProps) {
    const { supabaseUser: user, login } = useAuth()
    const { showSnackbar } = useSnackbar()
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState<Comment[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const { open: openLoginModal } = useModal('login-confirmation')
    const { open: openDeleteModal, close: closeDeleteModal } = useModal('delete-confirmation')

    useEffect(() => {
        fetchCommentsData()
    }, [recipeId])

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const fetchCommentsData = async () => {
        try {
            setLoading(true)
            const { comments: data, total: count } = await getComments(recipeId, 1, 5)
            setComments(data as any[])
            setTotal(count)
            setPage(1)
        } catch (error) {
            console.error("Error fetching comments:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadMoreComments = async () => {


        setLoadingMore(true)
        try {
            const nextPage = page + 1
            const { comments: newComments } = await getComments(recipeId, nextPage, 5)
            setComments(prev => [...prev, ...newComments as any[]])
            setPage(nextPage)
        } catch (error) {
            console.error("Error loading more comments:", error)
        } finally {
            setLoadingMore(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setSelectedImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const clearImage = () => {
        setSelectedImage(null)
        setPreviewUrl(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()



        setSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('content', comment)
            formData.append('recipe_id', recipeId)
            formData.append('user_id', user!.id)

            let finalFile = selectedImage
            if (selectedImage) {
                finalFile = await compressImage(selectedImage)
                formData.append('file', finalFile)
            }

            await postComment(formData)

            setComment("")
            clearImage()
            fetchCommentsData()
            showSnackbar("¡Comentario publicado!", "success")
        } catch (error: any) {
            console.error("Error saving comment:", error)
            showSnackbar(error.message || "Error al publicar comentario", "error")
        } finally {
            setSubmitting(false)
        }
    }

    const handleLoginClick = () => {
        openLoginModal({
            onConfirm: async () => {
                await login()
            }
        })
    }

    const handleDeleteComment = (commentId: string) => {
        openDeleteModal({
            title: "¿Eliminar comentario?",
            description: "¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.",
            onConfirm: async () => {
                try {
                    await deleteComment(commentId)
                    showSnackbar("Comentario eliminado", "success")
                    // Refresh comments or remove from state
                    setComments(prev => prev.filter(c => c.id !== commentId))
                    setTotal(prev => prev - 1)
                    closeDeleteModal()
                } catch (error: any) {
                    console.error("Error deleting comment:", error)
                    showSnackbar(error.message || "Error al eliminar comentario", "error")
                }
            }
        })
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary">Comentarios ({total})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.full_name || 'User'}
                        className="w-10 h-10 rounded-full border border-primary/20 shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="relative">
                            <Textarea
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="min-h-[80px] bg-card border-primary/20 focus-visible:ring-primary pr-12"
                            />
                            <div className="absolute bottom-2 right-2">
                                <label className="cursor-pointer p-2 [@media(hover:hover)]:hover:bg-primary/10 rounded-full transition-colors inline-flex items-center justify-center text-primary/60 [@media(hover:hover)]:hover:text-primary">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Camera className="w-5 h-5" />
                                </label>
                            </div>
                        </div>

                        {previewUrl && (
                            <div className="relative inline-block">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded-lg border border-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-0.5 rounded-full [@media(hover:hover)]:hover:bg-destructive/90 shadow-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                data-testid="submit-button"
                                type="submit"
                                disabled={(!comment.trim() && !selectedImage) || submitting}
                                className="bg-primary [@media(hover:hover)]:hover:bg-primary/90 text-primary-foreground"
                            >
                                {submitting ? "Publicando..." : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                    <p className="text-primary mb-3">
                        Para dejar un comentario necesitás iniciar sesión ✨
                    </p>
                    <Button
                        onClick={handleLoginClick}
                        variant="outline"
                        className="border-primary/20 [@media(hover:hover)]:hover:bg-primary/10 text-primary"
                    >
                        <LogIn className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                    </Button>
                </div>
            )}

            <div className="space-y-4 mt-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <>
                        <CommentSkeleton />
                        <CommentSkeleton />
                        <CommentSkeleton />
                    </>
                ) : comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay comentarios aún. ¡Sé el primero!</p>
                ) : (
                    <>
                        {comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-4 p-4 bg-card rounded-xl border border-primary/10 dark:border-primary/20 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={comment.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={comment.profiles?.full_name || 'User'}
                                    className="w-10 h-10 rounded-full border border-primary/10 shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-foreground">
                                            {comment.profiles?.full_name || 'Usuario'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-muted-foreground whitespace-pre-wrap flex-1">{comment.content}</p>
                                        {user && (user.id === comment.user_id || user.id === recipeOwnerId) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 ml-2"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                aria-label="Eliminar comentario"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
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
                                    disabled={loadingMore}
                                    className="text-primary border-primary/20 [@media(hover:hover)]:hover:bg-primary/10"
                                >
                                    {loadingMore ? "Cargando..." : "Cargar más comentarios"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    )
}
