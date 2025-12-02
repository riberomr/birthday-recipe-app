import { supabase } from "./supabase"
import { Recipe, RecipeCategory } from "@/types"

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
      recipe_categories (*)
    `)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching recipes:", error)
        return []
    }

    return data || []
}

export async function getRecipe(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
        .from("recipes")
        .select(`
      *,
      recipe_ingredients (*),
      recipe_steps (*),
      recipe_categories (*)
    `)
        .eq("id", id)
        .single()

    if (error) {
        console.error("Error fetching recipe:", error)
        return null
    }

    // Sort steps by order
    if (data && data.recipe_steps) {
        data.recipe_steps.sort((a: any, b: any) => a.step_order - b.step_order)
    }

    return data
}
