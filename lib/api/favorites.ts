import { supabase } from "@/lib/supabase";
import { Recipe } from "@/types";
import { getAverageRating } from "../utils";

export async function getFavorites(userId: string) {
    const { data, error } = await supabase
        .from("favorites")
        .select(`
                recipe_id,
                recipes (
                *,
                ratings (rating)
                )
        `)
        .eq("user_id", userId);
    console.log(data)
    const recipes = data?.map((item: any) => {
        const average_rating = getAverageRating(item.recipes.ratings)
        return {
            ...item.recipes,
            average_rating
        }
    }) as Recipe[];
    if (error) throw error;

    return recipes;
}

export async function checkIsFavorite(userId: string, recipeId: string) {
    const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .eq("recipe_id", recipeId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
    return !!data;
}

export async function toggleFavorite(userId: string, recipeId: string, isFavorite: boolean) {
    if (isFavorite) {
        const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("recipe_id", recipeId);
        if (error) throw error;
        return false; // Now it's not a favorite
    } else {
        const { error } = await supabase
            .from("favorites")
            .insert([{ user_id: userId, recipe_id: recipeId }]);
        if (error) throw error;
        return true; // Now it is a favorite
    }
}
