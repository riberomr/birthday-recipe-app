import { supabase } from "../supabase/client"
import { SupabaseUser } from "@/types"

export async function getUsers(): Promise<SupabaseUser[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, updated_at")
        .order("full_name")

    if (error) {
        console.error("Error fetching users:", error)
        return []
    }

    return data || []
}

export async function getUsersWithRecipes(): Promise<
    Array<SupabaseUser & { recipe_count: number }>
> {
    const { data, error } = await supabase
        .from("profiles")
        .select(`
      id,
      email,
      full_name,
      avatar_url,
      updated_at,
      recipes (count)
    `)
        .order("full_name")

    if (error) {
        console.error("Error fetching users with recipes:", error)
        return []
    }

    const usersWithRecipes = (data || []).map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        updated_at: user.updated_at,
        recipe_count: user.recipes?.[0]?.count ?? 0
    }))

    return usersWithRecipes.filter(user => user.recipe_count > 0)
}
