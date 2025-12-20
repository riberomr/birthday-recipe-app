import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/requireAuth"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // 1. Verify Authentication
        const decodedToken = await getUserFromRequest(request)
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // 2. Get the comment to check ownership and recipe association
        const { data: comment, error: commentError } = await supabaseAdmin
            .from("comments")
            .select("user_id, recipe_id")
            .eq("id", id)
            .eq("is_deleted", false)
            .single()

        if (commentError || !comment) {
            return NextResponse.json(
                { error: "Comment not found" },
                { status: 404 }
            )
        }

        // 3. Get user profile to match with comment/recipe owner
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

        const currentUserId = profile.id
        let isAuthorized = false

        // Check if user is the comment author
        if (comment.user_id === currentUserId) {
            isAuthorized = true
        } else {
            // Check if user is the recipe owner
            const { data: recipe, error: recipeError } = await supabaseAdmin
                .from("recipes")
                .select("user_id")
                .eq("id", comment.recipe_id)
                .single()

            if (!recipeError && recipe && recipe.user_id === currentUserId) {
                isAuthorized = true
            }
        }

        if (!isAuthorized) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            )
        }

        // 4. Perform logical delete
        const { error: updateError } = await supabaseAdmin
            .from("comments")
            .update({ is_deleted: true })
            .eq("id", id)

        if (updateError) {
            console.error("Error deleting comment:", updateError)
            return NextResponse.json(
                { error: "Failed to delete comment" },
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
