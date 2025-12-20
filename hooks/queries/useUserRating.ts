import { useQuery } from '@tanstack/react-query';
import { getUserRating } from '@/lib/api/ratings';

export function useUserRating(recipeId: string, userId: string | undefined) {
    return useQuery({
        queryKey: ['ratings', recipeId, 'user', userId],
        queryFn: () => getUserRating(userId!, recipeId),
        enabled: !!recipeId && !!userId,
    });
}
