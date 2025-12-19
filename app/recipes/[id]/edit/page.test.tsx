import { render, screen } from '@testing-library/react'
import EditRecipePage from './page'
import { getRecipe } from '@/lib/api/recipes'
import { notFound } from 'next/navigation'

jest.mock('@/lib/api/recipes')
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_NOT_FOUND')
    })
}))
jest.mock('@/components/RecipeForm', () => ({
    RecipeForm: ({ initialData, isEditing }: any) => (
        <div data-testid="recipe-form">
            <div data-testid="recipe-id">{initialData?.id}</div>
            <div data-testid="is-editing">{isEditing ? 'true' : 'false'}</div>
        </div>
    )
}))

describe('EditRecipePage', () => {
    const mockRecipe = {
        id: '1',
        title: 'Test Recipe',
        description: 'Test Description'
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders RecipeForm with recipe data in edit mode', async () => {
        (getRecipe as jest.Mock).mockResolvedValue(mockRecipe)

        const jsx = await EditRecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('recipe-form')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-id')).toHaveTextContent('1')
        expect(screen.getByTestId('is-editing')).toHaveTextContent('true')
    })

    it('calls notFound when recipe does not exist', async () => {
        (getRecipe as jest.Mock).mockResolvedValue(null)

        await expect(EditRecipePage({ params: Promise.resolve({ id: '999' }) }))
            .rejects.toThrow('NEXT_NOT_FOUND')

        expect(notFound).toHaveBeenCalled()
    })
})
