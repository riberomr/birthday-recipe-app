"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Send } from "lucide-react"

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
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [recipeId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from("comments")
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .eq("recipe_id", recipeId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching comments:", error)
        } else {
            setComments(data || [])
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!comment.trim() || !user) return

        const { error } = await supabase
            .from("comments")
            .insert({
                recipe_id: recipeId,
                user_id: user.id,
                content: comment
            })

        if (error) {
            console.error("Error saving comment:", error)
        } else {
            setComment("")
            fetchComments()
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-400">Comentarios</h3>

            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={user.user_metadata.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.user_metadata.full_name || 'User'}
                        className="w-10 h-10 rounded-full border border-pink-200"
                    />
                    <div className="flex-1 gap-2 flex flex-col sm:flex-row">
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Escribe un comentario kawaii..."
                            className="min-h-[80px] bg-white dark:bg-zinc-900 border-pink-200 dark:border-pink-900 focus-visible:ring-pink-400"
                        />
                        <Button
                            type="submit"
                            disabled={!comment.trim()}
                            className="bg-pink-500 hover:bg-pink-600 text-white self-end sm:self-start"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-center text-pink-600 dark:text-pink-400">
                    Inicia sesión para dejar un comentario ✨
                </div>
            )}

            <div className="space-y-4 mt-8">
                {loading ? (
                    <p className="text-center text-gray-500">Cargando comentarios...</p>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500">No hay comentarios aún. ¡Sé el primero!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-pink-100 dark:border-pink-900/50 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={comment.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt={comment.profiles?.full_name || 'User'}
                                className="w-10 h-10 rounded-full border border-pink-100"
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {comment.profiles?.full_name || 'Usuario'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
