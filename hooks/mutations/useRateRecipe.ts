import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertRating } from '@/lib/api/ratings';
import { useAuth } from '@/components/AuthContext';

export function useRateRecipe() {
    const queryClient = useQueryClient();
    const { supabaseUser } = useAuth();

    return useMutation({
        mutationFn: ({ recipeId, rating }: { recipeId: string; rating: number }) =>
            upsertRating(recipeId, rating),
        onMutate: async ({ recipeId, rating }) => {
            if (!supabaseUser) return;

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['ratings', recipeId] });

            // Snapshot previous value
            const previousUserRating = queryClient.getQueryData(['ratings', recipeId, 'user', supabaseUser.id]);

            // Optimistically update user rating
            queryClient.setQueryData(['ratings', recipeId, 'user', supabaseUser.id], rating);

            // Optimistically update average (approximation)
            // Note: Updating average accurately requires knowing the previous rating to subtract it and add new one.
            // For simplicity, we might just update the user rating and let average refresh on success.
            // Or we can try to update it if we have the data.

            return { previousUserRating };
        },
        onError: (err, { recipeId }, context) => {
            if (context?.previousUserRating !== undefined && supabaseUser) {
                queryClient.setQueryData(['ratings', recipeId, 'user', supabaseUser.id], context.previousUserRating);
            }
        },
        onSuccess: (_, { recipeId }) => {
            queryClient.invalidateQueries({ queryKey: ['ratings', recipeId] });
            queryClient.invalidateQueries({ queryKey: ['recipes'] }); // To update list view if it shows ratings
        },
    });
}
