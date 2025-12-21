import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertRating } from '@/lib/api/ratings';
import { useAuth } from '@/components/AuthContext';

export function useRateRecipe() {
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    return useMutation({
        mutationFn: ({ recipeId, rating }: { recipeId: string; rating: number }) =>
            upsertRating(recipeId, rating),
        onMutate: async ({ recipeId, rating }) => {
            if (!profile) return;

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['ratings', recipeId] });

            // Snapshot previous value
            const previousUserRating = queryClient.getQueryData(['ratings', recipeId, 'user', profile.id]);

            // Optimistically update user rating
            queryClient.setQueryData(['ratings', recipeId, 'user', profile.id], rating);

            // Optimistically update average (approximation)
            // Note: Updating average accurately requires knowing the previous rating to subtract it and add new one.
            // For simplicity, we might just update the user rating and let average refresh on success.
            // Or we can try to update it if we have the data.

            return { previousUserRating };
        },
        onError: (err, { recipeId }, context) => {
            if (context) {
                /* istanbul ignore next */
                if (!profile) return;

                if (context.previousUserRating === undefined) {
                    queryClient.removeQueries({ queryKey: ['ratings', recipeId, 'user', profile.id] });
                } else {
                    queryClient.setQueryData(['ratings', recipeId, 'user', profile.id], context.previousUserRating);
                }
            }
        },
        onSuccess: (_, { recipeId }) => {
            queryClient.invalidateQueries({ queryKey: ['ratings', recipeId] });
            queryClient.invalidateQueries({ queryKey: ['recipes'] }); // To update list view if it shows ratings
        },
    });
}
