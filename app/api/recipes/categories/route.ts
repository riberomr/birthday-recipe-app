import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("recipe_categories")
            .select("*")
            .order("name");

        if (error) {
            console.error("Error fetching categories:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [], error: null });

    } catch (error: any) {
        console.error("Error in categories route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
