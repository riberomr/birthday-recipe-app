import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FavoriteButton } from './FavoriteButton'
import { useAuth } from './AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { checkIsFavorite, toggleFavorite } from '@/lib/api/favorites'

// Mock dependencies
jest.mock('./AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: jest.fn(),
}))
jest.mock('@/lib/api/favorites', () => ({
    checkIsFavorite: jest.fn(),
    toggleFavorite: jest.fn(),
}))

describe('FavoriteButton', () => {
    const mockUser = { id: 'user-1' }
    const mockShowSnackbar = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (checkIsFavorite as jest.Mock).mockResolvedValue(false)
            ; (toggleFavorite as jest.Mock).mockResolvedValue(true)
    })

    it('renders correctly', async () => {
        render(<FavoriteButton recipeId="recipe-1" />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('checks favorite status on mount', async () => {
        ; (checkIsFavorite as jest.Mock).mockResolvedValue(true)
        render(<FavoriteButton recipeId="recipe-1" />)

        await waitFor(() => {
            expect(checkIsFavorite).toHaveBeenCalledWith('user-1', 'recipe-1')
        })
        // Should have active class or style (checking class might be brittle, checking icon fill is better but icon is inside)
    })

    it('toggles favorite on click', async () => {
        render(<FavoriteButton recipeId="recipe-1" />)

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(toggleFavorite).toHaveBeenCalledWith('user-1', 'recipe-1', false)
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agregado a favoritos', 'success')
        })
    })

    it('shows error if not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null })
        render(<FavoriteButton recipeId="recipe-1" />)

        fireEvent.click(screen.getByRole('button'))

        expect(toggleFavorite).not.toHaveBeenCalled()
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringMatching(/iniciar sesión/i), 'error')
    })
})
