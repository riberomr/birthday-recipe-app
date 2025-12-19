import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StarRating } from './StarRating'
import { useAuth } from './AuthContext'
import { getUserRating, upsertRating } from '@/lib/api/ratings'

// Mock dependencies
jest.mock('./AuthContext', () => ({
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
})
