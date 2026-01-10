import { render, screen } from '@testing-library/react'
import RecipesPage from './page'
import { getRecipes, getCategories } from '@/lib/api/recipes'

// Mock dependencies
jest.mock('@/lib/api/recipes', () => ({
    getRecipes: jest.fn(),
    getCategories: jest.fn()
}))

jest.mock('@/components/RecipeListClient', () => ({
    RecipeListClient: () => (
        <div data-testid="recipe-list-client">
            RecipeListClient
        </div>
    )
}))

describe('RecipesPage', () => {
    it('fetches data and renders RecipeListClient', async () => {
        const mockRecipes = [{ id: '1', title: 'Recipe 1' }]
        const mockCategories = [{ id: '1', name: 'Cat 1' }]

        const jsx = await RecipesPage()
        render(jsx)

        expect(screen.getByTestId('recipe-list-client')).toBeInTheDocument()
        expect(screen.getByText('RecipeListClient')).toBeInTheDocument()
        expect(screen.getByText('Recetas')).toBeInTheDocument()
    })
    it('exports dynamic configuration', () => {
        const { dynamic } = require('./page')
        expect(dynamic).toBe('force-dynamic')
    })
})
