import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest } from '@/lib/auth/requireAuth';

export async function GET(request: Request, { params }: { params: Promise<{ uid: string }> }) {
    try {
        const { uid } = await params;

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("firebase_uid", uid)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data, error: null });

    } catch (error: any) {
        console.error("Error in user profile route:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ uid: string }> }) {
    try {
        const { uid } = await params;
        const decodedToken = await getUserFromRequest(request);

        if (!decodedToken || decodedToken.uid !== uid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update(updates)
            .eq("firebase_uid", uid)
            .select()
            .single();

        if (error) {
            console.error("Error updating user profile:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data, error: null });

    } catch (error: any) {
        console.error("Error updating user profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
