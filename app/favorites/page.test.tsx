import { render, screen, waitFor } from '@testing-library/react'
import FavoritesPage from './page'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { getFavorites } from '@/lib/api/favorites'

jest.mock('@/components/AuthContext')
jest.mock('@/components/ui/Snackbar')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))
jest.mock('@/lib/api/favorites')
jest.mock('@/components/RecipeCard', () => ({
    RecipeCard: ({ recipe }: any) => <div data-testid={`recipe-${recipe.id}`}>{recipe.title}</div>
}))

describe('FavoritesPage', () => {
    const mockRouter = { push: jest.fn() }
    const mockShowSnackbar = jest.fn()
    const mockUser = { id: 'user-1' }
    const mockFavorites = [
        { id: '1', title: 'Recipe 1' },
        { id: '2', title: 'Recipe 2' }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (getFavorites as jest.Mock).mockResolvedValue(mockFavorites)
    })

    it('redirects to home when user is not logged in', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null, isLoading: false })

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Debes iniciar sesión para ver tus favoritos', 'error')
            expect(mockRouter.push).toHaveBeenCalledWith('/')
        })
    })

    it('displays favorites when loaded', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, isLoading: false })

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(screen.getByText('Mis Favoritos')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-2')).toBeInTheDocument()
        })
    })

    it('shows empty state when no favorites', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, isLoading: false })
            ; (getFavorites as jest.Mock).mockResolvedValue([])

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(screen.getByText(/no tienes recetas favoritas aún/i)).toBeInTheDocument()
        })
    })

    it('handles fetch error gracefully', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser, isLoading: false })
            ; (getFavorites as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al cargar favoritos', 'error')
        })

        consoleError.mockRestore()
    })

    it('returns null when user is not authenticated after loading', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null, isLoading: false })

        const { container } = render(<FavoritesPage />)

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })
})
