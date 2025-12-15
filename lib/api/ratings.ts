import { auth } from "@/lib/firebase/client";
import { supabase } from "@/lib/supabase/client";

export async function getUserRating(userId: string, recipeId: string) {
    // Reading public/user data via Supabase client is fine if RLS allows it.
    // Ratings are generally public or at least readable.
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

    if (!response.ok) throw new Error("Error saving rating");
}
