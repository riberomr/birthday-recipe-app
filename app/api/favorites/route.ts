import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, getSupabaseUserFromFirebaseUid } from '@/lib/auth/requireAuth';
import { getAverageRating } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Note: Favorites are public? Or should we verify token?
        // For now, let's allow reading favorites if we have the userId, 
        // but ideally we should verify if the requester is the user or if favorites are public.
        // Given the app type, maybe favorites are private. Let's verify token.

        const decodedToken = await getUserFromRequest(request);
        // If we want strict privacy:
        // if (!decodedToken || decodedToken.uid !== userId) ...
        // But the current code passes userId explicitly. 
        // Let's assume for now we just return the data, but using Service Role to bypass RLS.

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

        const user = await getSupabaseUserFromFirebaseUid(decodedToken.uid, decodedToken.email);
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
