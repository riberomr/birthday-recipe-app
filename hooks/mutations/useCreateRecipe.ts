import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createRecipe } from "@/lib/api/recipes"

export function useCreateRecipe() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (formData: FormData) => createRecipe(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recipes"] })
        },
    })
}
