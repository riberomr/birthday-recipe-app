import { supabase } from "../supabase"
import { Recipe, RecipeCategory } from "@/types"
import { getAverageRating } from "../utils"

export async function getCategories(): Promise<RecipeCategory[]> {
    const { data, error } = await supabase
        .from("recipe_categories")
        .select("*")
        .order("name")

    if (error) {
        console.error("Error fetching categories:", error)
        return []
    }

    return data || []
}

export async function getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
        .from("recipes")
        .select(`
      *,
      recipe_ingredients (*),
      recipe_categories (*),
      ratings (rating),
      recipe_tags (tags (*))
    `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching recipes:", error)
        return []
    }

    const recipes = data.map((recipe) => {
        const average_rating = getAverageRating(recipe.ratings)
        return { ...recipe, average_rating }
    })
    return recipes || []
}

export async function getRecipe(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from("recipes")
        .select(`
      *,
      recipe_ingredients (*),
      recipe_steps (*),
      recipe_categories (*),
      recipe_nutrition (*),
      ratings (rating),
      recipe_tags (tags (*))
    `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching recipe:", error)
        return null
    }

    data.average_rating = getAverageRating(data.ratings)
    // Sort steps by order
    if (data && data.recipe_steps) {
        data.recipe_steps.sort((a: any, b: any) => a.step_order - b.step_order)
    }

    return data
}

type RecipeCommunityPhoto = {
    image_url: string
}
export async function getRecipeCommunityPhotos(recipeId: string): Promise<RecipeCommunityPhoto[] | null> {
    const { data, error } = await supabase
        .from("comments")
        .select(`
                image_url
            `)
        .eq("recipe_id", recipeId)
        .not("image_url", "is", null)
        .neq("image_url", "")
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching community photos:", error)
        return null
    }

    return data
}

export async function createRecipe(formData: FormData) {
    const response = await fetch('/app/api/create-recipe-with-image', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error desconocido al crear la receta');
    }

    return result;
}

