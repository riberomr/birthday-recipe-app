import { render, screen } from '@testing-library/react'
import { RecipeDetailClient } from '../RecipeDetailClient'
import { useRecipe } from '@/hooks/queries/useRecipe'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

// Mocks
jest.mock('@/hooks/queries/useRecipe')
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}))
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))
jest.mock('@/components/StarRating', () => ({
    StarRating: () => <div data-testid="star-rating" />,
}))
jest.mock('@/components/CommentSection', () => ({
    CommentSection: () => <div data-testid="comment-section" />,
}))
jest.mock('@/components/DownloadButton', () => ({
    DownloadButton: () => <button>Download</button>,
}))
jest.mock('@/components/ShareButtons', () => ({
    ShareButtons: () => <div data-testid="share-buttons" />,
}))
jest.mock('@/components/IngredientScaler', () => ({
    IngredientScaler: ({ ingredients }: any) => <div>{ingredients.map((i: any) => i.name).join(', ')}</div>,
}))
jest.mock('@/components/CommunityRecipesPhotoCarrousel', () => ({
    __esModule: true,
    default: () => <div data-testid="community-photos" />,
}))
jest.mock('@/components/FavoriteButton', () => ({
    FavoriteButton: () => <button>Favorite</button>,
}))
jest.mock('@/components/RatingSection', () => ({
    RatingSection: () => <div data-testid="rating-section" />,
}))
jest.mock('@/components/EditRecipeButton', () => ({
    EditRecipeButton: () => <button>Edit</button>,
}))
jest.mock('@/components/DeleteRecipeButton', () => ({
    DeleteRecipeButton: () => <button>Delete</button>,
}))

const mockRecipe = {
    id: '1',
    title: 'Test Recipe',
    description: 'Test Description',
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    user_id: 'user1',
    image_url: 'http://example.com/image.jpg',
    recipe_ingredients: [{ id: '1', name: 'Flour', amount: '1 cup' }],
    recipe_steps: [{ id: '1', step_order: 1, content: 'Mix' }],
    recipe_nutrition: [{ id: '1', name: 'Calories', amount: '100', unit: 'kcal' }],
    profile: { full_name: 'Test User', avatar_url: 'http://example.com/avatar.jpg' },
    average_rating: { rating: 4.5, count: 10 },
}

describe('RecipeDetailClient', () => {
    const mockRouter = { push: jest.fn() }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue(mockRouter)
            ; (useRecipe as jest.Mock).mockReturnValue({
                data: mockRecipe,
                isLoading: false,
                isError: false,
            })
            ; (useQuery as jest.Mock).mockReturnValue({
                data: [],
            })
    })

    it('renders recipe details correctly', () => {
        render(<RecipeDetailClient id="1" />)

        expect(screen.getAllByText('Test Recipe')[0]).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Prep: 10m')).toBeInTheDocument()
        expect(screen.getByText('Cocción: 20m')).toBeInTheDocument()
        expect(screen.getByText('Flour')).toBeInTheDocument() // From IngredientScaler mock
        expect(screen.getByText('Mix')).toBeInTheDocument()
        expect(screen.getByText('Calories')).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('kcal')).toBeInTheDocument()
        expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('shows loading state', () => {
        ; (useRecipe as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { container } = render(<RecipeDetailClient id="1" />)
        expect(container.getElementsByClassName('animate-pulse').length).toBeGreaterThan(0)
    })

    it('shows error state and redirect button', () => {
        ; (useRecipe as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        render(<RecipeDetailClient id="1" />)
        expect(screen.getByText('Receta no encontrada 😢')).toBeInTheDocument()

        const backButton = screen.getByText('Volver a Recetas')
        backButton.click()
        expect(mockRouter.push).toHaveBeenCalledWith('/recipes')
    })

    it('renders community photos if available', () => {
        ; (useQuery as jest.Mock).mockReturnValue({
            data: [{ id: '1', url: 'photo.jpg' }],
        })

        render(<RecipeDetailClient id="1" />)
        expect(screen.getByTestId('community-photos')).toBeInTheDocument()
    })
})
