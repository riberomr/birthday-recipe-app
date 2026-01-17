import { useQuery } from '@tanstack/react-query';
import { getRecipeRating } from '@/lib/api/ratings';

/**
 * NOTE: This hook is currently unused in the UI as of [Date].
 * The average rating is now passed directly from the Recipe object to avoid redundant API calls.
 * We are keeping this hook for potential future use cases where we might need to fetch
 * just the rating without the full recipe.
 */
export function useRecipeRating(recipeId: string) {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING === 'true';

    return useQuery({
        queryKey: ['ratings', recipeId],
        queryFn: () => getRecipeRating(recipeId),
        enabled: !!recipeId && isEnabled,
    });
}
