import { supabase } from "@/lib/supabase";

export async function getUserRating(userId: string, recipeId: string) {
    const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("recipe_id", recipeId)
        .eq("user_id", userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.rating || 0;
}

export async function upsertRating(userId: string, recipeId: string, rating: number) {
    const { error } = await supabase
        .from("ratings")
        .upsert(
            {
                recipe_id: recipeId,
                user_id: userId,
                rating: rating
            },
            {
                onConflict: 'recipe_id,user_id'
            }
        );

    if (error) throw error;
}
