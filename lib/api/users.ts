import { Profile } from "@/types"
import { auth } from "@/lib/firebase/client"

export async function getUsers(): Promise<Profile[]> {
    const response = await fetch('/api/users');
    if (!response.ok) {
        console.error("Error fetching users");
        return [];
    }
    const { data } = await response.json();
    return data || [];
}

export async function getUsersWithRecipes(): Promise<
    Array<Profile & { recipe_count: number }>
> {
    const response = await fetch('/api/users?withRecipes=true');
    if (!response.ok) {
        console.error("Error fetching users with recipes");
        return [];
    }
    const { data } = await response.json();
    return data || [];
}

export async function getUserProfile(firebaseUid: string): Promise<Profile | null> {
    const response = await fetch(`/api/users/${firebaseUid}`);
    if (!response.ok) {
        console.error("Error fetching user profile");
        return null;
    }
    const { data } = await response.json();
    return data;
}

export async function updateUserProfile(firebaseUid: string, updates: Partial<Profile>): Promise<Profile | null> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();

    const response = await fetch(`/api/users/${firebaseUid}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error updating user profile");
    }

    const { data } = await response.json();
    return data;
}
