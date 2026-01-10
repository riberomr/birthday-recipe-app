import { useQuery } from "@tanstack/react-query"
import { getCategories } from "@/lib/api/recipes"
import { RecipeCategory } from "@/types"

export function useCategories() {
    return useQuery<RecipeCategory[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
    })
}
