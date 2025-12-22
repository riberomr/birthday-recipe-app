import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAverageRating } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from("recipes")
            .select(`
                *,
                recipe_ingredients (*),
                recipe_steps (*),
                recipe_categories (*),
                recipe_nutrition (*),
                ratings (rating),
                recipe_tags (tags (*)),
                profile:profiles (
                    id,
                    email,
                    full_name,
                    avatar_url,
                    updated_at
                )
            `)
            .eq("id", id)
            .eq("is_deleted", false)
            .single();

        if (error) {
            console.error("Error fetching recipe:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ data: null, error: null });
        }

        data.average_rating = getAverageRating(data.ratings || [])

        // Sort steps by order
        if (data.recipe_steps) {
            data.recipe_steps.sort((a: any, b: any) => a.step_order - b.step_order);
        }

        return NextResponse.json({ data: data, error: null });

    } catch (error: any) {
        console.error("Error in recipe details route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
