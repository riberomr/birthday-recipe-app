import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ recipeId: string }> }) {
    try {
        const { recipeId } = await params;

        const { data, error } = await supabaseAdmin
            .from("ratings")
            .select("rating")
            .eq("recipe_id", recipeId);

        if (error) {
            console.error("Error fetching ratings:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const ratings = data || [];
        const count = ratings.length;
        const average = count > 0
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / count
            : 0;

        return NextResponse.json({ data: { average, count }, error: null });

    } catch (error: any) {
        console.error("Error in ratings route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
