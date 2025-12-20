import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FavoriteButton } from '../FavoriteButton'
import { useAuth } from '../AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useFavorites } from '@/hooks/queries/useFavorites'
import { useToggleFavorite } from '@/hooks/mutations/useToggleFavorite'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: jest.fn(),
}))
jest.mock('@/hooks/queries/useFavorites')
jest.mock('@/hooks/mutations/useToggleFavorite')

describe('FavoriteButton', () => {
    const mockUser = { id: 'user-1' }
    const mockShowSnackbar = jest.fn()
    const mockRecipe = { id: 'recipe-1', title: 'Test Recipe' } as any
    const mockToggle = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
            ; (useFavorites as jest.Mock).mockReturnValue({ data: [] })
            ; (useToggleFavorite as jest.Mock).mockReturnValue({
                mutate: mockToggle,
                isPending: false
            })
    })

    it('renders correctly', () => {
        render(<FavoriteButton recipe={mockRecipe} />)
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('shows filled heart if favorite', () => {
        ; (useFavorites as jest.Mock).mockReturnValue({ data: [mockRecipe] })
        render(<FavoriteButton recipe={mockRecipe} />)
        expect(screen.getByRole('button')).toHaveClass('text-destructive')
    })

    it('toggles favorite on click', () => {
        render(<FavoriteButton recipe={mockRecipe} />)

        fireEvent.click(screen.getByRole('button'))

        expect(mockToggle).toHaveBeenCalledWith(mockRecipe, expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function)
        }))
    })

    it('shows error if not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null })
        render(<FavoriteButton recipe={mockRecipe} />)

        fireEvent.click(screen.getByRole('button'))

        expect(mockToggle).not.toHaveBeenCalled()
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringMatching(/iniciar sesión/i), 'error')
    })

    it('disables button while pending', () => {
        ; (useToggleFavorite as jest.Mock).mockReturnValue({
            mutate: mockToggle,
            isPending: true
        })
        render(<FavoriteButton recipe={mockRecipe} />)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('calls onSuccess callback', () => {
        mockToggle.mockImplementation((recipe, { onSuccess }) => {
            onSuccess()
        })

        render(<FavoriteButton recipe={mockRecipe} />)
        fireEvent.click(screen.getByRole('button'))

        expect(mockShowSnackbar).toHaveBeenCalledWith('Agregado a favoritos', 'success')
    })

    it('calls onError callback', () => {
        mockToggle.mockImplementation((recipe, { onError }) => {
            onError()
        })

        render(<FavoriteButton recipe={mockRecipe} />)
        fireEvent.click(screen.getByRole('button'))

        expect(mockShowSnackbar).toHaveBeenCalledWith('Error al actualizar favoritos', 'error')
    })
})
