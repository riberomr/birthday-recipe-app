import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FavoriteButton } from '../FavoriteButton'
import { useAuth } from '../AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { checkIsFavorite, toggleFavorite } from '@/lib/api/favorites'

// Mock dependencies
jest.mock('../AuthContext', () => ({
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
    })

    it('toggles favorite on click', async () => {
        render(<FavoriteButton recipeId="recipe-1" />)

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(toggleFavorite).toHaveBeenCalledWith('user-1', 'recipe-1', false)
            expect(mockShowSnackbar).toHaveBeenCalledWith('Agregado a favoritos', 'success')
        })
    })

    it('removes favorite on click when already favorite', async () => {
        ; (checkIsFavorite as jest.Mock).mockResolvedValue(true)
            ; (toggleFavorite as jest.Mock).mockResolvedValue(false)

        render(<FavoriteButton recipeId="recipe-1" />)

        // Wait for initial check and UI update
        await waitFor(() => {
            expect(checkIsFavorite).toHaveBeenCalled()
            expect(screen.getByRole('button')).toHaveClass('text-destructive')
        })

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(toggleFavorite).toHaveBeenCalledWith('user-1', 'recipe-1', true)
            expect(mockShowSnackbar).toHaveBeenCalledWith('Eliminado de favoritos', 'success')
        })
    })

    it('shows error if not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null })
        render(<FavoriteButton recipeId="recipe-1" />)

        fireEvent.click(screen.getByRole('button'))

        expect(toggleFavorite).not.toHaveBeenCalled()
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringMatching(/iniciar sesión/i), 'error')
    })

    it('handles toggle favorite error', async () => {
        ; (toggleFavorite as jest.Mock).mockRejectedValue(new Error('Toggle failed'))
        const consoleError = jest.spyOn(console, 'error').mockImplementation()

        render(<FavoriteButton recipeId="recipe-1" />)

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Error toggling favorite:', expect.any(Error))
            expect(mockShowSnackbar).toHaveBeenCalledWith('Error al actualizar favoritos', 'error')
        })

        consoleError.mockRestore()
    })

    it('prevents multiple simultaneous toggles when loading', async () => {
        let resolveToggle: (value: boolean) => void
        const togglePromise = new Promise<boolean>((resolve) => {
            resolveToggle = resolve
        })
            ; (toggleFavorite as jest.Mock).mockReturnValue(togglePromise)

        render(<FavoriteButton recipeId="recipe-1" />)

        const button = screen.getByRole('button')

        // First click starts loading
        fireEvent.click(button)

        // Second and third clicks should be ignored (loading guard)
        fireEvent.click(button)
        fireEvent.click(button)

        // Resolve the first toggle
        resolveToggle!(true)

        await waitFor(() => {
            // Should only have been called once (subsequent clicks ignored while loading)
            expect(toggleFavorite).toHaveBeenCalledTimes(1)
        })
    })
})
