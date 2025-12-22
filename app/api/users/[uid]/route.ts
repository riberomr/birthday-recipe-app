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

        // Ensure the request body is a plain object
        if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
        }
        // Remove fields that must not be user-editable
        const forbiddenFields = ["id", "created_at", "firebase_uid"];
        const safeUpdates: Record<string, unknown> = Object.fromEntries(
            Object.entries(updates).filter(([key]) => !forbiddenFields.includes(key))
        );
        // If nothing remains after sanitization, there's nothing to update
        if (Object.keys(safeUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update(safeUpdates)
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
