import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest, getProfileFromFirebase } from '@/lib/auth/requireAuth';
import { getAverageRating } from '@/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const decodedToken = await getUserFromRequest(request);
        console.log(decodedToken, "decodedToken");
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getProfileFromFirebase(decodedToken.uid, decodedToken.email);
        if (!user || user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from("favorites")
            .select(`
        recipe_id,
        recipes!inner (
            *,
            ratings (rating)
        )
    `)
            .eq("user_id", userId)
            .eq("recipes.is_deleted", false)
            .order("created_at", { ascending: false });

        if (error) throw error;

        const recipes = data?.map((item: any) => {
            const average_rating = getAverageRating(item.recipes.ratings)
            return {
                ...item.recipes,
                average_rating
            }
        });

        return NextResponse.json(recipes || []);
    } catch (error: any) {
        console.error("Error fetching favorites:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const decodedToken = await getUserFromRequest(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getProfileFromFirebase(decodedToken.uid, decodedToken.email);
        const { recipeId } = await request.json();

        if (!recipeId) {
            return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 });
        }

        // Check if exists
        const { data: existing } = await supabaseAdmin
            .from("favorites")
            .select("*")
            .eq("user_id", user.id)
            .eq("recipe_id", recipeId)
            .single();

        if (existing) {
            // Remove
            const { error } = await supabaseAdmin
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("recipe_id", recipeId);
            if (error) throw error;
            return NextResponse.json({ isFavorite: false });
        } else {
            // Add
            const { error } = await supabaseAdmin
                .from("favorites")
                .insert([{ user_id: user.id, recipe_id: recipeId }]);
            if (error) throw error;
            return NextResponse.json({ isFavorite: true });
        }

    } catch (error: any) {
        console.error("Error toggling favorite:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
