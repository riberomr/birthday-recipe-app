import { screen } from '@testing-library/react'
import { RatingSection } from '../RatingSection'
import { useAuth } from '../AuthContext'
import { renderWithClient } from '@/lib/test-utils'
import { useRecipeRating } from '@/hooks/queries/useRecipeRating'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('../StarRating', () => ({
    StarRating: () => <div data-testid="star-rating">Star Rating</div>,
}))
jest.mock('@/hooks/queries/useRecipeRating')

describe('RatingSection', () => {
    beforeEach(() => {
        (useRecipeRating as jest.Mock).mockReturnValue({ data: { average: 0, count: 0 } })
    })

    it('renders when logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: { id: '1' } })
        renderWithClient(<RatingSection recipeId="1" />)
        expect(screen.getByText('Calificar Receta')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
    })

    it('does not render when logged out', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" />)
        expect(screen.queryByText('Calificar Receta')).not.toBeInTheDocument()
    })

    it('displays singular vote count', () => {
        (useRecipeRating as jest.Mock).mockReturnValue({ data: { average: 5, count: 1 } })
            ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" />)
        expect(screen.getByText('(1 voto)')).toBeInTheDocument()
    })

    it('displays plural vote count', () => {
        (useRecipeRating as jest.Mock).mockReturnValue({ data: { average: 4.5, count: 2 } })
            ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" />)
        expect(screen.getByText('(2 votos)')).toBeInTheDocument()
    })
})
