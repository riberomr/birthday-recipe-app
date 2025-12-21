import { useInfiniteQuery } from "@tanstack/react-query"
import { getRecipes } from "@/lib/api/recipes"
import { useAuth } from "@/components/AuthContext"

export function useMyRecipes() {
    const { profile } = useAuth()
    const userId = profile?.id

    return useInfiniteQuery({
        queryKey: ["recipes", "my-recipes", userId],
        queryFn: async ({ pageParam = 1 }) => {
            if (!userId) return { recipes: [], total: 0, page: pageParam }
            const { recipes, total } = await getRecipes(pageParam, 6, { user_id: userId })
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
        enabled: !!userId,
    })
}
