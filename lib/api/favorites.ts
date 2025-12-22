import { auth } from "@/lib/firebase/client";
import { Recipe } from "@/types";

export async function getFavorites(userId: string): Promise<Recipe[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/favorites?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Error fetching favorites");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching or parsing favorites:", error);
        return [];
    }
}

export async function toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean }> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");


    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ recipeId })
        });

        if (!response.ok) {
            throw new Error("Error toggling favorite");
        }
        return await response.json();
    } catch (error) {
        throw new Error("Error toggling favorite");
    }
}
