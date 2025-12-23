import { Profile } from "@/types"
import { auth } from "@/lib/firebase/client"
import { User } from "firebase/auth"

export async function getUsers(): Promise<Profile[]> {
    try {
        const response = await fetch(`/api/users`);
        if (!response.ok) {
            console.error("Error fetching users");
            return [];
        }
        const { data } = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching or parsing users:", error);
        return [];
    }
}

export async function getUsersWithRecipes(): Promise<
    Array<Profile & { recipe_count: number }>
> {
    try {
        const response = await fetch(`/api/users?withRecipes=true`);
        if (!response.ok) {
            console.error("Error fetching users with recipes");
            return [];
        }
        const { data } = await response.json();
        return data || [];
    } catch (error) {
        console.error("Error fetching or parsing users with recipes:", error);
        return [];
    }
}

export async function getUserProfile(firebaseUid: string): Promise<Profile | null> {
    try {
        const response = await fetch(`/api/users/${firebaseUid}`);
        if (!response.ok) {
            console.error("Error fetching user profile");
            return null;
        }
        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching or parsing user profile:", error);
        return null;
    }
}

export async function updateUserProfile(firebaseUid: string, updates: Partial<Profile>): Promise<Profile | null> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");


    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/users/${firebaseUid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error('Error al procesar la respuesta del servidor');
        }

        if (!response.ok) {
            throw new Error(result.error || "Error updating user profile");
        }

        return result.data;
    } catch (error: any) {
        throw new Error(error.message || "Error updating user profile");
    }
}

export async function initProfile(user: User | null): Promise<Profile | null> {
    try {
        if (!user) {
            // If no user is provided, do not attempt to initialize a profile and return null.
            return null;
        }

        const token = await user.getIdToken();
        const response = await fetch(`/api/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Error initializing user profile");
            return null;
        }

        const json = await response.json();
        // The API returns { user: ... }
        return json.user || null;
    } catch (error: any) {
        console.error(error.message || "Error initializing user profile");
        return null;
    }
}
