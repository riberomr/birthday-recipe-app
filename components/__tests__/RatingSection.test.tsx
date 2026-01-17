import { screen } from '@testing-library/react'
import { RatingSection } from '../RatingSection'
import { useAuth } from '../AuthContext'
import { renderWithClient } from '@/lib/test-utils'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('../StarRating', () => ({
    StarRating: () => <div data-testid="star-rating">Star Rating</div>,
}))

describe('RatingSection', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING = 'true';
        process.env.NEXT_PUBLIC_ENABLE_USER_RATING = 'true';
    })

    afterEach(() => {
        process.env = originalEnv;
    })

    it('renders rating section when logged in and flags enabled', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: { id: '1' } })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 0, count: 0 }} />)
        expect(screen.getByText('Calificar Receta')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
    })

    it('does not render rating section when logged out (but shows average)', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 0, count: 0 }} />)
        expect(screen.queryByText('Calificar Receta')).not.toBeInTheDocument()
    })

    it('displays singular vote count', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 5, count: 1 }} />)
        expect(screen.getByText('(1 voto)')).toBeInTheDocument()
    })

    it('displays plural vote count', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 4.5, count: 2 }} />)
        expect(screen.getByText('(2 votos)')).toBeInTheDocument()
    })

    it('hides average rating when flag is disabled', () => {
        process.env.NEXT_PUBLIC_ENABLE_AVERAGE_RATING = 'false';
        ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 4.5, count: 2 }} />)
        expect(screen.queryByText('(2 votos)')).not.toBeInTheDocument()
    })

    it('hides user rating section when flag is disabled', () => {
        process.env.NEXT_PUBLIC_ENABLE_USER_RATING = 'false';
        ; (useAuth as jest.Mock).mockReturnValue({ profile: { id: '1' } })
        renderWithClient(<RatingSection recipeId="1" initialAverageRating={{ rating: 0, count: 0 }} />)
        expect(screen.queryByText('Calificar Receta')).not.toBeInTheDocument()
    })
})
