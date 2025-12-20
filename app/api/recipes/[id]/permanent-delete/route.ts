import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/requireAuth"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Performs a permanent delete of a recipe.
 *
 * This function removes the recipe record from the database, effectively deleting it from the application.
 *
 * We separate logical and permanent delete operations to ensure safety and prevent accidental data loss.
 * Logical delete is the default action for users.
 *
 * Not need of check if is soft deleted, because we are deleting the recipe from the database.
 * This endpoint will be used only by admins.
 *
 * If the users use this endpoint, it will be via an action after the recipe was soft deleted.
 * 
 * @param id - The unique identifier of the recipe to delete.
 * @returns A promise that resolves to the API response result.
 * @throws Error if the user is not authenticated or the operation fails.
 */

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verify Authentication
        const decodedToken = await getUserFromRequest(request)
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify ownership
        const { data: recipe, error: fetchError } = await supabaseAdmin
            .from("recipes")
            .select("user_id")
            .eq("id", id)
            .single()

        if (fetchError || !recipe) {
            return NextResponse.json(
                { error: "Recipe not found" },
                { status: 404 }
            )
        }

        // Get user profile to check ownership
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("firebase_uid", decodedToken.uid)
            .single()

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            )
        }

        if (recipe.user_id !== profile.id) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        // Perform physical delete
        const { error: deleteError } = await supabaseAdmin
            .from("recipes")
            .delete()
            .eq("id", id)

        if (deleteError) {
            console.error("Error deleting recipe:", deleteError)
            return NextResponse.json(
                { error: "Failed to delete recipe" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
