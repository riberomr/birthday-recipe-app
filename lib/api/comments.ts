import { supabase } from "@/lib/supabase";

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
    const response = await fetch('/api/comments/create', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error al publicar comentario');
    }

    return result;
}
