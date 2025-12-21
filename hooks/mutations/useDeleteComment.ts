import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/lib/api/comments';

export function useDeleteComment(recipeId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
            queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] });
        },
    });
}
