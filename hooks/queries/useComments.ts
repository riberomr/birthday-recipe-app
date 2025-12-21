import { useQuery } from '@tanstack/react-query';
import { getComments } from '@/lib/api/comments';

export function useComments(recipeId: string, page: number = 1, limit: number = 5) {
    return useQuery({
        queryKey: ['comments', recipeId, page, limit],
        queryFn: () => getComments(recipeId, page, limit),
        staleTime: 30000, // 30 seconds
        enabled: !!recipeId,
    });
}
