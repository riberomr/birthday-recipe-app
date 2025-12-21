import { supabase } from "../supabase/client"
import { Profile } from "@/types"

export async function getUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, firebase_uid, email, full_name, avatar_url, updated_at")
        .order("full_name")

    if (error) {
        console.error("Error fetching users:", error)
        return []
    }

    return data || []
}

export async function getUsersWithRecipes(): Promise<
    Array<Profile & { recipe_count: number }>
> {
    const { data, error } = await supabase
        .from("profiles")
        .select(`
      id,
      firebase_uid,
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
        firebase_uid: user.firebase_uid,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        updated_at: user.updated_at,
        recipe_count: user.recipes?.[0]?.count ?? 0
    }))

    return usersWithRecipes.filter(user => user.recipe_count > 0)
}

export async function getUserProfile(firebaseUid: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .single()

    if (error) {
        console.error("Error fetching user profile:", error)
        return null
    }

    return data
}

export async function updateUserProfile(firebaseUid: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("firebase_uid", firebaseUid)
        .select()
        .single()

    if (error) {
        console.error("Error updating user profile:", error)
        throw error
    }

    return data
}
