import { render, screen } from '@testing-library/react'
import RecipesPage from './page'
import { getRecipes, getCategories } from '@/lib/api/recipes'

// Mock dependencies
jest.mock('@/lib/api/recipes', () => ({
    getRecipes: jest.fn(),
    getCategories: jest.fn()
}))

jest.mock('@/components/RecipeListClient', () => ({
    RecipeListClient: ({ initialRecipes, initialTotal, categories }: any) => (
        <div data-testid="recipe-list-client">
            Recipes: {initialRecipes.length}, Total: {initialTotal}, Categories: {categories.length}
        </div>
    )
}))

describe('RecipesPage', () => {
    it('fetches data and renders RecipeListClient', async () => {
        const mockRecipes = [{ id: '1', title: 'Recipe 1' }]
        const mockCategories = [{ id: '1', name: 'Cat 1' }]

            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: mockRecipes, total: 1 })
            ; (getCategories as jest.Mock).mockResolvedValue(mockCategories)

        const jsx = await RecipesPage()
        render(jsx)

        expect(getRecipes).toHaveBeenCalledWith(1, 6)
        expect(getCategories).toHaveBeenCalled()

        expect(screen.getByTestId('recipe-list-client')).toBeInTheDocument()
        expect(screen.getByText('Recipes: 1, Total: 1, Categories: 1')).toBeInTheDocument()
        expect(screen.getByText('Recetas')).toBeInTheDocument()
    })
})
