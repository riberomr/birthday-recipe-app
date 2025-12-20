import { useQuery } from '@tanstack/react-query';
import { getRecipeRating } from '@/lib/api/ratings';

export function useRecipeRating(recipeId: string) {
    return useQuery({
        queryKey: ['ratings', recipeId],
        queryFn: () => getRecipeRating(recipeId),
        enabled: !!recipeId,
    });
}
