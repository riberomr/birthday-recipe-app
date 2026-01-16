import { screen } from '@testing-library/react'
import RecipePage from './page'
import { getRecipe, getRecipeCommunityPhotos } from '@/lib/api/recipes'
import { renderWithClient } from '@/lib/test-utils'

jest.mock('@/lib/api/recipes')
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_NOT_FOUND')
    }),
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}))

// Mock all child components
jest.mock('@/components/DisplayRating', () => ({
    DisplayRating: () => <div data-testid="star-rating">Star Rating</div>
}))
jest.mock('@/components/CommentSection', () => ({
    CommentSection: () => <div data-testid="comment-section">Comments</div>
}))
jest.mock('@/components/DownloadButton', () => ({
    DownloadButton: () => <button data-testid="download-button">Download</button>
}))
jest.mock('@/components/ShareButtons', () => ({
    ShareButtons: () => <div data-testid="share-buttons">Share</div>
}))
jest.mock('@/components/IngredientScaler', () => ({
    IngredientScaler: ({ ingredients }: any) => (
        <div data-testid="ingredient-scaler">{ingredients.length} ingredients</div>
    )
}))
jest.mock('@/components/CommunityRecipesPhotoCarrousel', () => ({
    __esModule: true,
    default: ({ photos }: any) => <div data-testid="community-photos">{photos.length} photos</div>
}))
jest.mock('@/components/FavoriteButton', () => ({
    FavoriteButton: () => <button data-testid="favorite-button">Favorite</button>
}))
jest.mock('@/components/RatingSection', () => ({
    RatingSection: () => <div data-testid="rating-section">Rating</div>
}))
jest.mock('@/components/RecipeActionsMenu', () => ({
    RecipeActionsMenu: () => <div data-testid="recipe-actions-menu">Actions</div>
}))

// Mock AuthContext
jest.mock('@/components/AuthContext', () => ({
    useAuth: jest.fn(() => ({
        profile: { id: 'user-1' } // Match default mockRecipe.user_id
    }))
}))

describe('RecipePage', () => {
    const mockRecipe = {
        id: '1',
        title: 'Test Recipe',
        description: 'Test Description',
        image_url: 'https://example.com/image.jpg',
        prep_time_minutes: 15,
        cook_time_minutes: 30,
        servings: 4,
        user_id: 'user-1',
        average_rating: { rating: 4.5, count: 10 },
        profile: {
            full_name: 'John Doe',
            avatar_url: 'https://example.com/avatar.jpg'
        },
        recipe_ingredients: [
            { id: '1', ingredient: 'Flour', amount: '2 cups' }
        ],
        recipe_steps: [
            { id: '1', step_order: 1, content: 'Mix ingredients' }
        ],
        recipe_nutrition: [
            { id: '1', name: 'Calories', amount: '200', unit: 'kcal' }
        ]
    }

    const mockCommunityPhotos = [
        { id: '1', image_url: 'https://example.com/photo1.jpg' },
        { id: '2', image_url: 'https://example.com/photo2.jpg' }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
            ; (getRecipe as jest.Mock).mockResolvedValue(mockRecipe)
            ; (getRecipeCommunityPhotos as jest.Mock).mockResolvedValue(mockCommunityPhotos)
    })



    it('renders recipe without image (fallback emoji)', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, image_url: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('🥘')).toBeInTheDocument()
    })

    it('renders profile information when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('John Doe')).toBeInTheDocument()
        expect(screen.getByAltText('John Doe')).toBeInTheDocument()
    })

    it('renders without profile information', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, profile: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Receta compartida por:')).not.toBeInTheDocument()
    })

    it('renders with partial profile information', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            profile: { full_name: null, avatar_url: null }
        })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('Usuario')).toBeInTheDocument()
        expect(screen.getByAltText('Usuario')).toBeInTheDocument()
    })

    it('renders nutrition information when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('Información Nutricional')).toBeInTheDocument()
        expect(screen.getByText('Calories')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('renders without rating when not available', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, average_rating: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('(10)')).not.toBeInTheDocument()
    })

    it('does not render nutrition section when empty', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_nutrition: [] })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Información Nutricional')).not.toBeInTheDocument()
    })

    it('renders community photos when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByTestId('community-photos')).toBeInTheDocument()
        expect(screen.getByText('2 photos')).toBeInTheDocument()
    })

    it('does not render community photos when none available', async () => {
        ; (getRecipeCommunityPhotos as jest.Mock).mockResolvedValue([])

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByTestId('community-photos')).not.toBeInTheDocument()
    })

    it('renders all interactive components', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByTestId('favorite-button')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-actions-menu')).toBeInTheDocument()
        expect(screen.getByTestId('download-button')).toBeInTheDocument()
        expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
        expect(screen.getByTestId('rating-section')).toBeInTheDocument()
        expect(screen.getByTestId('comment-section')).toBeInTheDocument()
    })

    it('renders ingredient scaler with correct data', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByTestId('ingredient-scaler')).toBeInTheDocument()
        expect(screen.getByText('1 ingredients')).toBeInTheDocument()
    })

    it('renders recipe steps', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('Preparación')).toBeInTheDocument()
        expect(screen.getByText('Mix ingredients')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // step number
    })

    it('renders without steps when not available', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders cooking mode button with correct link', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        const cookingModeLink = await screen.findByRole('link', { name: /modo cocina/i })
        expect(cookingModeLink).toHaveAttribute('href', '/recipes/1/cook')
    })

    it('renders without steps when empty', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: [] })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders without steps when undefined', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: undefined })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders without profile', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, profile: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(screen.queryByText('Usuario')).not.toBeInTheDocument()
    })

    it('renders with default servings and empty ingredients', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            servings: null,
            recipe_ingredients: null
        })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        expect(await screen.findByText('Ingredientes')).toBeInTheDocument()
    })

    it('exports dynamic configuration', () => {
        const { dynamic } = require('./page')
        expect(dynamic).toBeUndefined()
    })


    it('renders back button with correct link', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        renderWithClient(jsx)

        const backButton = await screen.findByRole('link', { name: /volver a recetas/i })
        expect(backButton).toHaveAttribute('href', '/recipes')
    })
})
