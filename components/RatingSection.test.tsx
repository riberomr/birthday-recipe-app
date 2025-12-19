import { render, screen } from '@testing-library/react'
import { RatingSection } from './RatingSection'
import { useAuth } from './AuthContext'

// Mock dependencies
jest.mock('./AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('./StarRating', () => ({
    StarRating: () => <div data-testid="star-rating">Star Rating</div>,
}))

describe('RatingSection', () => {
    it('renders when logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ user: { id: '1' } })
        render(<RatingSection recipeId="1" />)
        expect(screen.getByText('Calificar Receta')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
    })

    it('does not render when logged out', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ user: null })
        render(<RatingSection recipeId="1" />)
        expect(screen.queryByText('Calificar Receta')).not.toBeInTheDocument()
    })
})
