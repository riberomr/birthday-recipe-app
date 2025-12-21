import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteRecipePermanently } from "@/lib/api/recipes"

export function usePermanentDeleteRecipe() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteRecipePermanently(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.removeQueries({ queryKey: ["recipes", id] })
        },
    })
}
