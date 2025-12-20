import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth/requireAuth"
import { supabaseAdmin } from "@/lib/supabase/admin"

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
            .eq("is_deleted", false)
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

        // Perform logical delete
        const { error: updateError } = await supabaseAdmin
            .from("recipes")
            .update({ is_deleted: true })
            .eq("id", id)

        if (updateError) {
            console.error("Error deleting recipe:", updateError)
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
