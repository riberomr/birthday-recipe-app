import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '@/lib/api/favorites';

export function useFavorites(userId: string | undefined) {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => getFavorites(userId!),
        enabled: !!userId,
    });
}
