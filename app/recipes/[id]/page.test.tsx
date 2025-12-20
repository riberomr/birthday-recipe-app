import { render, screen } from '@testing-library/react'
import RecipePage from './page'
import { getRecipe, getRecipeCommunityPhotos } from '@/lib/api/recipes'
import { notFound } from 'next/navigation'

jest.mock('@/lib/api/recipes')
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_NOT_FOUND')
    })
}))

// Mock all child components
jest.mock('@/components/StarRating', () => ({
    StarRating: () => <div data-testid="star-rating">Star Rating</div>
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
jest.mock('@/components/EditRecipeButton', () => ({
    EditRecipeButton: () => <button data-testid="edit-button">Edit</button>
}))
jest.mock('@/components/DeleteRecipeButton', () => ({
    DeleteRecipeButton: () => <button data-testid="delete-button">Delete</button>
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
        render(jsx)

        expect(screen.getByText('🥘')).toBeInTheDocument()
    })

    it('renders profile information when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByAltText('John Doe')).toBeInTheDocument()
    })

    it('renders without profile information', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, profile: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Receta compartida por')).not.toBeInTheDocument()
    })

    it('renders with partial profile information', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            profile: { full_name: null, avatar_url: null }
        })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('Usuario')).toBeInTheDocument()
        expect(screen.getByAltText('Usuario')).toBeInTheDocument()
    })

    it('renders nutrition information when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('Información Nutricional')).toBeInTheDocument()
        expect(screen.getByText('Calories')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
    })

    it('renders without rating when not available', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, average_rating: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('(10)')).not.toBeInTheDocument()
    })

    it('does not render nutrition section when empty', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_nutrition: [] })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Información Nutricional')).not.toBeInTheDocument()
    })

    it('renders community photos when available', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('community-photos')).toBeInTheDocument()
        expect(screen.getByText('2 photos')).toBeInTheDocument()
    })

    it('does not render community photos when none available', async () => {
        ; (getRecipeCommunityPhotos as jest.Mock).mockResolvedValue([])

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByTestId('community-photos')).not.toBeInTheDocument()
    })

    it('renders all interactive components', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('favorite-button')).toBeInTheDocument()
        expect(screen.getByTestId('edit-button')).toBeInTheDocument()
        expect(screen.getByTestId('download-button')).toBeInTheDocument()
        expect(screen.getByTestId('share-buttons')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
        expect(screen.getByTestId('rating-section')).toBeInTheDocument()
        expect(screen.getByTestId('comment-section')).toBeInTheDocument()
        expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    })

    it('renders ingredient scaler with correct data', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByTestId('ingredient-scaler')).toBeInTheDocument()
        expect(screen.getByText('1 ingredients')).toBeInTheDocument()
    })

    it('renders recipe steps', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('Preparación')).toBeInTheDocument()
        expect(screen.getByText('Mix ingredients')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // step number
    })

    it('renders without steps when not available', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders cooking mode button with correct link', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        const cookingModeLink = screen.getByRole('link', { name: /modo cocina/i })
        expect(cookingModeLink).toHaveAttribute('href', '/recipes/1/cook')
    })

    it('renders without steps when empty', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: [] })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders without steps when undefined', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, recipe_steps: undefined })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Mix ingredients')).not.toBeInTheDocument()
    })

    it('renders without profile', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({ ...mockRecipe, profile: null })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.queryByText('Usuario')).not.toBeInTheDocument()
    })

    it('renders with default servings and empty ingredients', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue({
            ...mockRecipe,
            servings: null,
            recipe_ingredients: null
        })

        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('Ingredientes')).toBeInTheDocument()
    })

    it('calls notFound when recipe does not exist', async () => {
        ; (getRecipe as jest.Mock).mockResolvedValue(null)

        await expect(RecipePage({ params: Promise.resolve({ id: '999' }) }))
            .rejects.toThrow('NEXT_NOT_FOUND')

        expect(notFound).toHaveBeenCalled()
    })

    it('exports dynamic configuration', () => {
        const { dynamic } = require('./page')
        expect(dynamic).toBe('force-dynamic')
    })


    it('renders back button with correct link', async () => {
        const jsx = await RecipePage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        const backButton = screen.getByRole('link', { name: /volver a recetas/i })
        expect(backButton).toHaveAttribute('href', '/recipes')
    })
})
