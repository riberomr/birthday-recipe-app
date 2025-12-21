import { adminAuth } from "@/lib/firebase/admin";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getUserFromRequest(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return null;

    const token = authHeader.replace("Bearer ", "");
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}

export async function getProfileFromFirebase(firebaseUid: string, email?: string, name?: string, avatarUrl?: string) {
    // 1. Try to find the user in profiles by firebase_uid
    const { data: user, error } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .single();

    if (user) return user;

    // 2. If not found, create a new profile
    if (!email) throw new Error("Email is required to create a user");

    const { data: newUser, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
            firebase_uid: firebaseUid,
            email: email,
            full_name: name,
            avatar_url: avatarUrl,
        })
        .select()
        .single();

    if (createError) {
        console.error("Error creating user in Supabase:", createError);
        throw createError;
    }

    return newUser;
}