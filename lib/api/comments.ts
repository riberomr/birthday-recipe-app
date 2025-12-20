import { supabase } from "@/lib/supabase/client";
import { auth } from "@/lib/firebase/client";
import { Comment } from "@/types";

export async function getComments(recipeId: string, page: number = 1, limit: number = 5): Promise<{ comments: Comment[], total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from("comments")
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `, { count: 'exact' })
        .eq("recipe_id", recipeId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, to)

    if (error) throw error;

    return { comments: (data as any[]) || [], total: count || 0 };
}

export async function postComment(formData: FormData): Promise<Comment> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Usuario no autenticado");
    }

    const token = await user.getIdToken();

    const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al publicar comentario');
    }

    return result.comment;
}

export async function deleteComment(id: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const token = await user.getIdToken();

    const response = await fetch(`/api/comments/${id}/delete`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al eliminar el comentario');
    }
}
