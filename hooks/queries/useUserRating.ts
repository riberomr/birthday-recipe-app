import { useQuery } from '@tanstack/react-query';
import { getUserRating } from '@/lib/api/ratings';

export function useUserRating(recipeId: string, userId: string | undefined) {
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_USER_RATING === 'true';

    return useQuery({
        queryKey: ['ratings', recipeId, 'user', userId],
        queryFn: () => getUserRating(recipeId),
        enabled: !!recipeId && !!userId && isEnabled,
    });
}
