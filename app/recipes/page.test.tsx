import { render, screen } from '@testing-library/react'
import RecipesPage from './page'

jest.mock('@/components/RecipeListClient', () => ({
    RecipeListClient: () => (
        <div data-testid="recipe-list-client">
            RecipeListClient
        </div>
    )
}))

describe('RecipesPage', () => {
    it('fetches data and renders RecipeListClient', async () => {

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
