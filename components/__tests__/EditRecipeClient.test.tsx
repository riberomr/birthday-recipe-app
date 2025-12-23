import { render, screen, fireEvent } from '@testing-library/react'
import { EditRecipeClient } from '../EditRecipeClient'
import { useRecipe } from '@/hooks/queries/useRecipe'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/hooks/queries/useRecipe')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))
jest.mock('@/components/RecipeForm', () => ({
    RecipeForm: ({ initialData, isEditing }: any) => (
        <div data-testid="recipe-form">
            <div data-testid="recipe-title">{initialData?.title}</div>
            <div data-testid="is-editing">{isEditing ? 'true' : 'false'}</div>
        </div>
    )
}))

// Mock Snackbar
const mockShowSnackbar = jest.fn()
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: () => ({
        showSnackbar: mockShowSnackbar
    })
}))

// Mock AuthContext
const mockUseAuth = jest.fn()
jest.mock('@/components/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

describe('EditRecipeClient', () => {
    const mockRouter = { push: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        mockUseAuth.mockReturnValue({ profile: { id: 'user1' } })
    })

    it('renders loading state', () => {
        (useRecipe as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
            isError: false
        })

        render(<EditRecipeClient id="1" />)
        // Check for loading spinner or container
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
        expect(screen.queryByTestId('recipe-form')).not.toBeInTheDocument()
        expect(screen.queryByText('Receta no encontrada 😢')).not.toBeInTheDocument()
    })

    it('renders error state when recipe not found or error occurs', () => {
        (useRecipe as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true
        })

        render(<EditRecipeClient id="1" />)

        expect(screen.getByText('Receta no encontrada 😢')).toBeInTheDocument()

        const backButton = screen.getByText('Volver a Recetas')
        fireEvent.click(backButton)
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes')
    })

    it('renders error state when data is null but no error flag (e.g. 404 handled by hook returning null)', () => {
        (useRecipe as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
            isError: false
        })

        render(<EditRecipeClient id="1" />)

        expect(screen.getByText('Receta no encontrada 😢')).toBeInTheDocument()
    })

    it('renders RecipeForm when data is loaded', () => {
        const mockRecipe = {
            id: '1',
            title: 'Delicious Cake',
            description: 'Yum'
        };
        (useRecipe as jest.Mock).mockReturnValue({
            data: mockRecipe,
            isLoading: false,
            isError: false
        })

        render(<EditRecipeClient id="1" />)

        expect(screen.getByTestId('recipe-form')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-title')).toHaveTextContent('Delicious Cake')
        expect(screen.getByTestId('is-editing')).toHaveTextContent('true')
    })

    it('redirects to recipes if user is not authenticated', () => {
        mockUseAuth.mockReturnValue({ profile: null });
        (useRecipe as jest.Mock).mockReturnValue({
            data: { id: '1', title: 'Test' },
            isLoading: false,
            isError: false
        })

        render(<EditRecipeClient id="1" />)

        expect(mockShowSnackbar).toHaveBeenCalledWith("Debes iniciar sesión para editar una receta", "error")
        expect(mockRouter.push).toHaveBeenCalledWith("/recipes")
    })
})
