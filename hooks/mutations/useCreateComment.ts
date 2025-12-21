import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment } from '@/lib/api/comments';

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => postComment(formData),
        onSuccess: (newComment, variables) => {
            const recipeId = variables.get('recipe_id') as string;
            if (recipeId) {
                queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
                queryClient.invalidateQueries({ queryKey: ['recipes', recipeId] });
            }
        },
    });
}
