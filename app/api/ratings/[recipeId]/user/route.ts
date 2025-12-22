import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest, getProfileFromFirebase } from '@/lib/auth/requireAuth';

export async function GET(request: Request, { params }: { params: Promise<{ recipeId: string }> }) {
    try {
        const { recipeId } = await params;

        // Verify Authentication
        const decodedToken = await getUserFromRequest(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile to get the correct user_id (Supabase ID)
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("firebase_uid", decodedToken.uid)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const { data, error } = await supabaseAdmin
            .from("ratings")
            .select("rating")
            .eq("recipe_id", recipeId)
            .eq("user_id", profile.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error("Error fetching user rating:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { rating: data?.rating || 0 }, error: null });

    } catch (error: any) {
        console.error("Error in user rating route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ recipeId: string }> }) {
    try {
        const { recipeId } = await params;

        // Verify Authentication
        const decodedToken = await getUserFromRequest(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getProfileFromFirebase(decodedToken.uid, decodedToken.email);
        const { rating } = await request.json();

        if (typeof rating !== 'number') {
            return NextResponse.json({ error: 'Missing rating' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("ratings")
            .upsert(
                {
                    recipe_id: recipeId,
                    user_id: user.id,
                    rating: rating
                },
                {
                    onConflict: 'recipe_id,user_id'
                }
            );

        if (error) {
            console.error("Error saving rating:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, error: null });

    } catch (error: any) {
        console.error("Error saving rating:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
