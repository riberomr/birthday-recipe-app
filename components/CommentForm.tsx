"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, X, LogIn } from "lucide-react"
import { useSnackbar } from "@/components/ui/Snackbar"
import { compressImage } from "@/lib/utils"
import { useModal } from "@/hooks/ui/useModal"
import { useCreateComment } from "@/hooks/mutations/useCreateComment"

interface CommentFormProps {
    recipeId: string
}

export function CommentForm({ recipeId }: CommentFormProps) {
    const { profile: user, login } = useAuth()
    const { showSnackbar } = useSnackbar()
    const [comment, setComment] = useState("")
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const { open: openLoginModal } = useModal('login-confirmation')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const { mutate: createComment } = useCreateComment()

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

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

        if (!user) return

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('content', comment)
            formData.append('recipe_id', recipeId)
            formData.append('user_id', user.id)

            if (selectedImage) {
                const compressedFile = await compressImage(selectedImage)
                formData.append('file', compressedFile)
            }

            createComment(formData, {
                onSuccess: () => {
                    setComment("")
                    clearImage()
                    showSnackbar("¡Comentario publicado!", "success")
                    setIsSubmitting(false)
                },
                onError: (error: any) => {
                    console.error("Error saving comment:", error)
                    showSnackbar(error.message || "Error al publicar comentario", "error")
                    setIsSubmitting(false)
                }
            })
        } catch (error: any) {
            console.error("Error preparing comment:", error)
            showSnackbar(error.message || "Error al preparar comentario", "error")
            setIsSubmitting(false)
        }
    }

    const handleLoginClick = () => {
        openLoginModal({
            onConfirm: async () => {
                await login()
            }
        })
    }

    if (!user) {
        return (
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
        )
    }

    return (
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
                        disabled={(!comment.trim() && !selectedImage) || isSubmitting}
                        className="bg-primary [@media(hover:hover)]:hover:bg-primary/90 text-primary-foreground"
                    >
                        {isSubmitting ? "Publicando..." : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </form>
    )
}
