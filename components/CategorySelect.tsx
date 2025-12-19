"use client"

import { RecipeCategory } from "@/types"

interface CategorySelectProps {
    categories: RecipeCategory[]
    selectedCategory: string | null
    onSelect: (categoryId: string | null) => void
}

export function CategorySelect({ categories, selectedCategory, onSelect }: CategorySelectProps) {
    return (
        <select
            value={selectedCategory || ""}
            onChange={(e) => onSelect(e.target.value || null)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    )
}
