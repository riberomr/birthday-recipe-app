import { render, screen } from '@testing-library/react'
import { RecipeCard } from './RecipeCard'
import { useAuth } from './AuthContext'

// Mock dependencies
jest.mock('./AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('./FavoriteButton', () => ({
    FavoriteButton: () => <button>Favorite</button>,
}))

const mockRecipe: any = {
    id: '1',
    title: 'Delicious Cake',
    description: 'A very yummy cake',
    image_url: 'http://example.com/cake.jpg',
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    average_rating: { rating: 4.5, count: 10 },
    category_id: '1',
    owner_id: 'user-1',
    user_id: 'user-1',
    created_at: '2023-01-01',
    ingredients: [],
    instructions: [],
}

describe('RecipeCard', () => {
    beforeEach(() => {
        ; (useAuth as jest.Mock).mockReturnValue({ supabaseUser: { id: 'user-1' } })
    })

    it('renders recipe details', () => {
        render(<RecipeCard recipe={mockRecipe} />)

        expect(screen.getByText('Delicious Cake')).toBeInTheDocument()
        expect(screen.getByText('A very yummy cake')).toBeInTheDocument()
        expect(screen.getByText('30 min')).toBeInTheDocument()
        expect(screen.getByText('20 min cook')).toBeInTheDocument()
        expect(screen.getByText('4.5 (10)')).toBeInTheDocument()
    })

    it('renders image', () => {
        render(<RecipeCard recipe={mockRecipe} />)
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('src', expect.stringContaining('cake.jpg'))
    })

    it('renders fallback when no image', () => {
        const recipeNoImage = { ...mockRecipe, image_url: null }
        render(<RecipeCard recipe={recipeNoImage} />)
        expect(screen.getByText('🥘')).toBeInTheDocument()
    })
})
