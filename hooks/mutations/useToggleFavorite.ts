import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from '@/lib/api/favorites';
import { Recipe } from '@/types';
import { useAuth } from '@/components/AuthContext';

export function useToggleFavorite() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    return useMutation({
        mutationFn: (recipe: Recipe) => toggleFavorite(recipe.id),
        onMutate: async (recipe) => {
            if (!profile) return;

            const queryKey = ['favorites', profile.id];

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousFavorites = queryClient.getQueryData<Recipe[]>(queryKey);

            // Optimistically update to the new value
            queryClient.setQueryData<Recipe[]>(queryKey, (old) => {
                if (!old) return [];
                const exists = old.some((r) => r.id === recipe.id);
                if (exists) {
                    return old.filter((r) => r.id !== recipe.id);
                } else {
                    return [...old, recipe];
                }
            });

            // Return a context object with the snapshotted value
            return { previousFavorites };
        },
        onError: (err, newTodo, context) => {
            if (profile && context?.previousFavorites) {
                queryClient.setQueryData(['favorites', profile.id], context.previousFavorites);
            }
        },
        onSettled: () => {
            if (profile) {
                queryClient.invalidateQueries({ queryKey: ['favorites', profile.id] });
            }
        },
    });
}
