import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyRecipesPage from './page'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { getRecipes } from '@/lib/api/recipes'

jest.mock('@/components/AuthContext')
jest.mock('@/components/ui/Snackbar')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))
jest.mock('@/lib/api/recipes')
jest.mock('@/components/RecipeCard', () => ({
    RecipeCard: ({ recipe }: any) => <div data-testid={`recipe-${recipe.id}`}>{recipe.title}</div>
}))

describe('MyRecipesPage', () => {
    const mockRouter = { push: jest.fn() }
    const mockShowSnackbar = jest.fn()
    const mockUser = { id: 'user-1' }
    const mockRecipes = [
        { id: '1', title: 'My Recipe 1' },
        { id: '2', title: 'My Recipe 2' }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: mockRecipes, total: 2 })
    })

    it('redirects to home when user is not logged in', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null, isLoading: false })

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Debes iniciar sesión para ver tus recetas', 'error')
            expect(mockRouter.push).toHaveBeenCalledWith('/')
        })
    })

    it('displays recipes when loaded', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(screen.getByText('Mis Recetas')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-2')).toBeInTheDocument()
        })
    })

    it('shows empty state with create button when no recipes', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: [], total: 0 })

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(screen.getByText(/no tienes recetas creadas aún/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /crear nueva receta/i })).toBeInTheDocument()
        })
    })

    it('navigates to create page when clicking create button', async () => {
        const user = userEvent.setup()
            ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: [], total: 0 })

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /crear nueva receta/i })).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /crear nueva receta/i }))

        expect(mockRouter.push).toHaveBeenCalledWith('/recipes/create')
    })

    it('handles fetch error gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (getRecipes as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al cargar mis recetas', 'error')
        })

        consoleError.mockRestore()
    })

    it('calls getRecipes with correct user filter', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })

        render(<MyRecipesPage />)

        await waitFor(() => {
            expect(getRecipes).toHaveBeenCalledWith(undefined, undefined, { user_id: 'user-1' })
        })
    })

    it('returns null when user is not authenticated after loading', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null, isLoading: false })

        const { container } = render(<MyRecipesPage />)

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })
})
