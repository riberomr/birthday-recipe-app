import { render, screen, waitFor } from '@testing-library/react'
import FavoritesPage from './page'
import { useAuth } from '@/components/AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/hooks/queries/useFavorites'

jest.mock('@/components/AuthContext')
jest.mock('@/components/ui/Snackbar')
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}))
jest.mock('@/hooks/queries/useFavorites')
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
            ; (useFavorites as jest.Mock).mockReturnValue({
                data: mockFavorites,
                isLoading: false,
                error: null
            })
    })

    it('redirects to home when user is not logged in', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null, isLoading: false })
            ; (useFavorites as jest.Mock).mockReturnValue({ data: undefined, isLoading: false })

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Debes iniciar sesión para ver tus favoritos', 'error')
            expect(mockRouter.push).toHaveBeenCalledWith('/')
        })
    })

    it('displays favorites when loaded', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })

        render(<FavoritesPage />)

        expect(screen.getByText('Mis Favoritos')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-2')).toBeInTheDocument()
    })

    it('shows empty state when no favorites', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useFavorites as jest.Mock).mockReturnValue({ data: [], isLoading: false })

        render(<FavoritesPage />)

        expect(screen.getByText(/no tienes recetas favoritas aún/i)).toBeInTheDocument()
    })

    it('handles fetch error gracefully', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useFavorites as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Fetch failed')
            })

        render(<FavoritesPage />)

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al cargar favoritos', 'error')
        })
    })

    it('shows loading state', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: mockUser, isLoading: false })
            ; (useFavorites as jest.Mock).mockReturnValue({ data: undefined, isLoading: true })

        render(<FavoritesPage />)

        // Loader2 is usually an SVG, we can look for it or just check if content is not there
        // The original code has a div with Loader2
        // We can check for a class or just that favorites are not shown
        expect(screen.queryByText('Mis Favoritos')).not.toBeInTheDocument()
    })
})
