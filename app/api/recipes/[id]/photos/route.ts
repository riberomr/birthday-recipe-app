import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from("comments")
            .select(`
                image_url
            `)
            .eq("recipe_id", id)
            .eq("is_deleted", false)
            .not("image_url", "is", null)
            .neq("image_url", "")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching community photos:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [], error: null });

    } catch (error: any) {
        console.error("Error in community photos route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
