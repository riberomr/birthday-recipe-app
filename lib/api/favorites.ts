import { auth } from "@/lib/firebase/client";
import { Recipe } from "@/types";

export async function getFavorites(userId: string): Promise<Recipe[]> {
    const response = await fetch(`/api/favorites?userId=${userId}`);
    if (!response.ok) {
        throw new Error("Error fetching favorites");
    }
    try {
        return await response.json();
    } catch (error) {
        console.error("Error parsing favorites response:", error);
        return [];
    }
}

export async function toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean }> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();

    const response = await fetch('/api/favorites', {
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
    try {
        return await response.json();
    } catch (error) {
        throw new Error("Error toggling favorite");
    }
}
