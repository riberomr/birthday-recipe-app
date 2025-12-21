import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateRecipe } from "@/lib/api/recipes"

export function useUpdateRecipe() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
            updateRecipe(id, formData),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
            queryClient.invalidateQueries({ queryKey: ["recipes", id] })
        },
    })
}
