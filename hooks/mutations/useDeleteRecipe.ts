import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRecipe } from "@/lib/api/recipes"

export function useDeleteRecipe(userId?: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteRecipe(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipes", id] })
            if (userId) {
                queryClient.invalidateQueries({ queryKey: ["recipes", "my-recipes", userId] })
            }
        },
    })
}
