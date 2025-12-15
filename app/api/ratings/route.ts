import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest, getSupabaseUserFromFirebaseUid } from '@/lib/auth/requireAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const decodedToken = await getUserFromRequest(request);
        if (!decodedToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getSupabaseUserFromFirebaseUid(decodedToken.uid, decodedToken.email);
        const { recipeId, rating } = await request.json();

        if (!recipeId || typeof rating !== 'number') {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
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

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error saving rating:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
