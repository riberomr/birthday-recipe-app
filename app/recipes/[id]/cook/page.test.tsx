import { render, screen } from '@testing-library/react'
import CookingPage from './page'

jest.mock('@/components/CookingModeClient', () => ({
    CookingModeClient: ({ recipeId }: any) => (
        <div data-testid="cooking-mode-client">
            <div data-testid="recipe-id">{recipeId}</div>
        </div>
    )
}))

describe('CookingPage', () => {
    it('renders CookingModeClient with recipeId', async () => {
        const jsx = await CookingPage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('cooking-mode-client')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-id')).toHaveTextContent('1')
    })

    it('exports dynamic configuration', () => {
        const { dynamic } = require('./page')
        expect(dynamic).toBe('force-dynamic')
    })
})
