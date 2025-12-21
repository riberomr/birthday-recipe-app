import { useInfiniteQuery } from "@tanstack/react-query"
import { getRecipes, RecipeFilters } from "@/lib/api/recipes"

export function useRecipes(filters: RecipeFilters = {}) {
    return useInfiniteQuery({
        queryKey: ["recipes", filters],
        queryFn: async ({ pageParam = 1 }) => {
            const { recipes, total } = await getRecipes(pageParam, 6, filters)
            return { recipes, total, page: pageParam }
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const loadedRecipes = lastPage.page * 6
            if (loadedRecipes < lastPage.total) {
                return lastPage.page + 1
            }
            return undefined
        },
    })
}
