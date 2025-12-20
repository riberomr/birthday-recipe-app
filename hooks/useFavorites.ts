import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '@/lib/api/favorites';
import { Recipe } from '@/types';

export function useFavorites(userId: string | undefined) {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => getFavorites(userId!),
        enabled: !!userId,
    });
}
