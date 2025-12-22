import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const withRecipes = searchParams.get('withRecipes') === 'true';

        let query = supabaseAdmin
            .from("profiles")
            .select(withRecipes ? `
                id,
                firebase_uid,
                email,
                full_name,
                avatar_url,
                updated_at,
                recipes (count)
            ` : "id, firebase_uid, email, full_name, avatar_url, updated_at")
            .order("full_name");

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching users:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (withRecipes) {
            const usersWithRecipes = (data || []).map((user: any) => ({
                id: user.id,
                firebase_uid: user.firebase_uid,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                updated_at: user.updated_at,
                recipe_count: user.recipes?.[0]?.count ?? 0
            })).filter((user: any) => user.recipe_count > 0);

            return NextResponse.json({ data: usersWithRecipes, error: null });
        }

        return NextResponse.json({ data: data || [], error: null });

    } catch (error: any) {
        console.error("Error in users route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
