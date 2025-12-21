import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getRecipe } from "@/lib/api/recipes"
import { Recipe } from "@/types"

export function useRecipe(id: string) {
    const queryClient = useQueryClient()

    return useQuery({
        queryKey: ["recipes", id],
        queryFn: () => getRecipe(id),
        placeholderData: () => {
            // Try to find the recipe in the 'recipes' list cache
            const queries = queryClient.getQueriesData<any>({ queryKey: ["recipes"] })

            for (const [_key, data] of queries) {
                if (data?.pages) {
                    for (const page of data.pages) {
                        const found = page.recipes.find((r: Recipe) => r.id === id)
                        if (found) return found
                    }
                }
            }
            return undefined
        },
    })
}
