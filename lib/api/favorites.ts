import { auth } from "@/lib/firebase/client";
import { Recipe } from "@/types";

export async function getFavorites(userId: string): Promise<Recipe[]> {
    const response = await fetch(`/api/favorites?userId=${userId}`);
    if (!response.ok) {
        throw new Error("Error fetching favorites");
    }
    return response.json();
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
    return response.json();
}
