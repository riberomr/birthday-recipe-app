import { auth } from "@/lib/firebase/client";
import { getBaseUrl } from "@/lib/utils";

export async function getRecipeRating(recipeId: string) {
    const response = await fetch(`${getBaseUrl()}/api/ratings/${recipeId}`);

    if (!response.ok) {
        console.error("Error fetching recipe rating");
        return { average: 0, count: 0 };
    }

    try {
        const { data } = await response.json();
        return data || { average: 0, count: 0 };
    } catch (error) {
        console.error("Error parsing recipe rating response:", error);
        return { average: 0, count: 0 };
    }
}

export async function getUserRating(recipeId: string) {
    const user = auth.currentUser;
    if (!user) return 0;

    const token = await user.getIdToken();
    const response = await fetch(`${getBaseUrl()}/api/ratings/${recipeId}/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // If 404 or other error, return 0
        return 0;
    }

    try {
        const { data } = await response.json();
        return data?.rating || 0;
    } catch (error) {
        return 0;
    }
}

export async function upsertRating(recipeId: string, rating: number) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    const token = await user.getIdToken();

    const response = await fetch(`${getBaseUrl()}/api/ratings/${recipeId}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
    });

    if (!response.ok) {
        let result;
        try {
            result = await response.json();
        } catch (error) {
            throw new Error("Error saving rating");
        }
        throw new Error(result.error || "Error saving rating");
    }

    try {
        return await response.json();
    } catch (error) {
        throw new Error("Error saving rating");
    }
}
