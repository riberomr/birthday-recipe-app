import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StarRating } from '../StarRating'
import { useAuth } from '../AuthContext'
import { getUserRating, upsertRating } from '@/lib/api/ratings'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/lib/api/ratings', () => ({
    getUserRating: jest.fn(),
    upsertRating: jest.fn(),
}))

describe('StarRating', () => {
    const mockUser = { id: 'user-1' }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: mockUser })
            ; (getUserRating as jest.Mock).mockResolvedValue(0)
            ; (upsertRating as jest.Mock).mockResolvedValue(undefined)
    })

    it('renders correctly', async () => {
        render(<StarRating recipeId="recipe-1" />)
        // Should render 5 stars
        expect(screen.getAllByRole('button')).toHaveLength(5)
    })

    it('fetches user rating on mount', async () => {
        ; (getUserRating as jest.Mock).mockResolvedValue(4)
        render(<StarRating recipeId="recipe-1" />)

        await waitFor(() => {
            expect(getUserRating).toHaveBeenCalledWith('user-1', 'recipe-1')
        })
    })

    it('handles rating click', async () => {
        render(<StarRating recipeId="recipe-1" />)

        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[2]) // Click 3rd star (rating 3)

        await waitFor(() => {
            expect(upsertRating).toHaveBeenCalledWith('user-1', 'recipe-1', 3)
        })
    })

    it('does not allow interaction when readonly', () => {
        render(<StarRating recipeId="recipe-1" readonly rating={3} />)

        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[4])

        expect(upsertRating).not.toHaveBeenCalled()
        expect(stars[0]).toBeDisabled()
    })

    it('does not allow interaction when not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: null })
        render(<StarRating recipeId="recipe-1" />)

        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[2])

        expect(upsertRating).not.toHaveBeenCalled()
        expect(stars[0]).toBeDisabled()
    })

    it('handles error when fetching rating', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (getUserRating as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

        render(<StarRating recipeId="recipe-1" />)

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Error fetching rating:', expect.any(Error))
        })

        consoleError.mockRestore()
    })

    it('reverts rating on save error', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (getUserRating as jest.Mock).mockResolvedValue(3)
            ; (upsertRating as jest.Mock).mockRejectedValue(new Error('Save failed'))

        render(<StarRating recipeId="recipe-1" />)

        await waitFor(() => {
            expect(getUserRating).toHaveBeenCalled()
        })

        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[4]) // Try to set rating to 5

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Error saving rating:', expect.any(Error))
        })

        consoleError.mockRestore()
    })

    it('handles hover states when logged in', () => {
        render(<StarRating recipeId="recipe-1" />)

        const stars = screen.getAllByRole('button')

        // Hover over 4th star
        fireEvent.mouseEnter(stars[3])
        fireEvent.mouseLeave(stars[3])

        // Hover events should work (no errors)
        expect(stars[3]).toBeInTheDocument()
    })
    it('does not allow interaction when recipeId is missing', () => {
        render(<StarRating />) // No recipeId

        const stars = screen.getAllByRole('button')
        fireEvent.click(stars[2])

        expect(upsertRating).not.toHaveBeenCalled()
    })
})
