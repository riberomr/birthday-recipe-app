import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const recipeId = searchParams.get('recipeId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');

        if (!recipeId) {
            return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabaseAdmin
            .from("comments")
            .select(`
                *,
                profiles (
                    full_name,
                    avatar_url
                )
            `, { count: 'exact' })
            .eq("recipe_id", recipeId)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching comments:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { comments: data || [], total: count || 0 }, error: null });

    } catch (error: any) {
        console.error("Error in comments route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
