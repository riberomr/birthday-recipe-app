import { auth } from "@/lib/firebase/client";
import { supabase } from "@/lib/supabase/client";

export async function getRecipeRating(recipeId: string) {
    const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("recipe_id", recipeId);

    if (error) throw error;

    const ratings = data || [];
    const count = ratings.length;
    const average = count > 0
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / count
        : 0;

    return { average, count };
}

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

export async function upsertRating(recipeId: string, rating: number) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();

    const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId, rating })
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error saving rating");
    }

    return await response.json();
}
