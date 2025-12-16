"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getComments, postComment } from "@/lib/api/comments"
import { Send, Camera, X } from "lucide-react"
import { useSnackbar } from "@/components/ui/Snackbar"
import { compressImage } from "@/lib/utils"
import { CommentSkeleton } from "@/components/CommentSkeleton"

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
}

export function CommentSection({ recipeId }: CommentSectionProps) {
    const { user } = useAuth()
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
        if (loadingMore || comments.length >= total) return

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
        if (!comment.trim() || !user) return

        setSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('content', comment)
            formData.append('recipe_id', recipeId)
            formData.append('user_id', user.uid)

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

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">Comentarios ({total})</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-full border border-pink-200 shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="relative">
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe un comentario kawaii..."
                                className="min-h-[80px] bg-white dark:bg-zinc-900 border-pink-200 dark:border-pink-900 focus-visible:ring-pink-400 pr-12"
                            />
                            <div className="absolute bottom-2 right-2">
                                <label className="cursor-pointer p-2 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-full transition-colors inline-flex items-center justify-center text-pink-400 hover:text-pink-500">
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
                                    className="h-20 w-20 object-cover rounded-lg border border-pink-200"
                                />
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600 shadow-sm"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={(!comment.trim() && !selectedImage) || submitting}
                                className="bg-pink-500 hover:bg-pink-600 text-white"
                            >
                                {submitting ? "Publicando..." : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-center text-pink-600 dark:text-pink-400">
                    Inicia sesión para dejar un comentario ✨
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
                    <p className="text-center text-gray-500 py-8">No hay comentarios aún. ¡Sé el primero!</p>
                ) : (
                    <>
                        {comments.map((comment: any) => (
                            <div key={comment.id} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-pink-100 dark:border-pink-900/50 shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={comment.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={comment.profiles?.full_name || 'User'}
                                    className="w-10 h-10 rounded-full border border-pink-100 shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {comment.profiles?.full_name || 'Usuario'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                    {comment.image_url && (
                                        <div className="mt-3">
                                            <img
                                                src={comment.image_url}
                                                alt="Foto del comentario"
                                                className="max-h-64 rounded-lg border border-pink-100 object-contain"
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
                                    className="text-pink-500 border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                                >
                                    {loadingMore ? "Cargando..." : "Cargar más comentarios"}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
