import { supabase } from "@/lib/supabase/client";
import { auth } from "@/lib/firebase/client";

export async function getComments(recipeId: string) {
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
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function postComment(formData: FormData) {
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

    return result;
}
