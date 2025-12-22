import { render, screen } from '@testing-library/react'
import EditRecipePage from './page'

// Mock the EditRecipeClient component
jest.mock('@/components/EditRecipeClient', () => ({
    EditRecipeClient: ({ id }: { id: string }) => (
        <div data-testid="edit-recipe-client">
            Client ID: {id}
        </div>
    )
}))

// Fallback mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    notFound: jest.fn()
}))
jest.mock('@/hooks/queries/useRecipe', () => ({
    useRecipe: jest.fn(() => ({ data: null, isLoading: true, isError: false }))
}))

describe('EditRecipePage', () => {
    it('renders EditRecipeClient with correct id', async () => {
        const jsx = await EditRecipePage({ params: Promise.resolve({ id: '123' }) })
        render(jsx)

        expect(screen.getByTestId('edit-recipe-client')).toBeInTheDocument()
        expect(screen.getByTestId('edit-recipe-client')).toHaveTextContent('Client ID: 123')
    })
})
