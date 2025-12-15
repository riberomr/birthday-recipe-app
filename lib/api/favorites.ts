import { auth } from "@/lib/firebase/client";
import { Recipe } from "@/types";

export async function getFavorites(userId: string) {
    const response = await fetch(`/api/favorites?userId=${userId}`);
    if (!response.ok) throw new Error("Error fetching favorites");
    return await response.json() as Recipe[];
}

export async function checkIsFavorite(userId: string, recipeId: string) {
    // This optimization (checking local cache or simple query) might be tricky via API 
    // without fetching all favorites. For now, let's fetch all and check.
    // Or better, we can assume the UI handles this state via the list of favorites.
    // But to keep API consistent, we might need a specific endpoint or just fetch all.
    // Let's fetch all for now as it's simpler and lists aren't huge.
    const favorites = await getFavorites(userId);
    return favorites.some(r => r.id === recipeId);
}

export async function toggleFavorite(userId: string, recipeId: string, isFavorite: boolean) {
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

    if (!response.ok) throw new Error("Error toggling favorite");
    const result = await response.json();
    return result.isFavorite;
}
