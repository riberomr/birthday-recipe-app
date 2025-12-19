import { render, screen } from '@testing-library/react'
import CookingPage from './page'
import { getRecipe } from '@/lib/api/recipes'
import { notFound } from 'next/navigation'

jest.mock('@/lib/api/recipes')
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_NOT_FOUND')
    })
}))
jest.mock('@/components/CookingModeClient', () => ({
    CookingModeClient: ({ steps, recipeId, recipeTitle }: any) => (
        <div data-testid="cooking-mode-client">
            <div data-testid="recipe-id">{recipeId}</div>
            <div data-testid="recipe-title">{recipeTitle}</div>
            <div data-testid="steps-count">{steps.length}</div>
        </div>
    )
}))

describe('CookingPage', () => {
    const mockRecipe = {
        id: '1',
        title: 'Test Recipe',
        recipe_steps: [
            { id: '1', step_order: 1, content: 'Step 1' },
            { id: '2', step_order: 2, content: 'Step 2' }
        ]
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders CookingModeClient with recipe data', async () => {
        (getRecipe as jest.Mock).mockResolvedValue(mockRecipe)

        const jsx = await CookingPage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('cooking-mode-client')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-id')).toHaveTextContent('1')
        expect(screen.getByTestId('recipe-title')).toHaveTextContent('Test Recipe')
        expect(screen.getByTestId('steps-count')).toHaveTextContent('2')
    })

    it('calls notFound when recipe does not exist', async () => {
        (getRecipe as jest.Mock).mockResolvedValue(null)

        await expect(CookingPage({ params: Promise.resolve({ id: '999' }) }))
            .rejects.toThrow('NEXT_NOT_FOUND')

        expect(notFound).toHaveBeenCalled()
    })

    it('calls notFound when recipe has no steps', async () => {
        (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            recipe_steps: []
        })

        await expect(CookingPage({ params: Promise.resolve({ id: '1' }) }))
            .rejects.toThrow('NEXT_NOT_FOUND')

        expect(notFound).toHaveBeenCalled()
    })

    it('calls notFound when recipe_steps is null', async () => {
        (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            recipe_steps: null
        })

        await expect(CookingPage({ params: Promise.resolve({ id: '1' }) }))
            .rejects.toThrow('NEXT_NOT_FOUND')

        expect(notFound).toHaveBeenCalled()
    })
})
