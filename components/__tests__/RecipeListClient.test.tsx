import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecipeListClient } from '../RecipeListClient'
import { useRecipes } from '@/hooks/queries/useRecipes'
import { useCategories } from '@/hooks/queries/useCategories'
import { useInView } from 'framer-motion'

// Mock dependencies
jest.mock('@/hooks/queries/useRecipes')
jest.mock('@/hooks/queries/useCategories')
jest.mock('@/components/FilterBar', () => ({
    FilterBar: ({ onFilterChange }: any) => (
        <button onClick={() => onFilterChange({ search: 'test' })}>Filter</button>
    ),
}))
jest.mock('@/components/RecipeCard', () => ({
    RecipeCard: ({ recipe }: any) => <div>{recipe.title}</div>,
}))
jest.mock('@/components/RecipeCardSkeleton', () => ({
    RecipeCardSkeleton: () => <div data-testid="skeleton" />,
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    },
    useInView: jest.fn()
}))

const mockRecipes = [
    { id: '1', title: 'Recipe 1' },
    { id: '2', title: 'Recipe 2' },
]

describe('RecipeListClient', () => {
    const mockFetchNextPage = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useInView as jest.Mock).mockReturnValue(false)
            ; (useRecipes as jest.Mock).mockReturnValue({
                data: {
                    pages: [{ recipes: mockRecipes, total: 2 }],
                },
                fetchNextPage: mockFetchNextPage,
                hasNextPage: false,
                isFetchingNextPage: false,
                isLoading: false,
                isError: false,
            })
            ; (useCategories as jest.Mock).mockReturnValue({
                data: [{ id: '1', name: 'Test Category' }],
                isLoading: false,
            })
    })

    it('renders initial recipes', () => {
        render(<RecipeListClient />)
        expect(screen.getByText('Recipe 1')).toBeInTheDocument()
        expect(screen.getByText('Recipe 2')).toBeInTheDocument()
    })

    it('renders empty state', () => {
        (useRecipes as jest.Mock).mockReturnValue({
            data: { pages: [{ recipes: [], total: 0 }] },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: false,
            isError: false,
        })

        render(<RecipeListClient />)
        expect(screen.getByText('No se encontraron recetas 🍰')).toBeInTheDocument()
    })

    it('filters recipes', async () => {
        render(<RecipeListClient />)

        fireEvent.click(screen.getByText('Filter'))

        await waitFor(() => {
            expect(useRecipes).toHaveBeenCalledWith(expect.objectContaining({ search: 'test' }))
        })
    })

    it('loads more recipes when button clicked', async () => {
        ; (useRecipes as jest.Mock).mockReturnValue({
            data: {
                pages: [{ recipes: mockRecipes, total: 3 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: false,
            isLoading: false,
            isError: false,
        })

        render(<RecipeListClient />)

        const loadMoreButton = screen.getByText('Cargar más')
        fireEvent.click(loadMoreButton)

        expect(mockFetchNextPage).toHaveBeenCalled()
    })

    it('shows loading state when fetching next page', () => {
        ; (useRecipes as jest.Mock).mockReturnValue({
            data: {
                pages: [{ recipes: mockRecipes, total: 3 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: true,
            isLoading: false,
            isError: false,
        })

        render(<RecipeListClient />)

        expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
    })

    it('triggers load more when in view', async () => {
        ; (useInView as jest.Mock).mockReturnValue(true)
            ; (useRecipes as jest.Mock).mockReturnValue({
                data: {
                    pages: [{ recipes: mockRecipes, total: 3 }],
                },
                fetchNextPage: mockFetchNextPage,
                hasNextPage: true,
                isFetchingNextPage: false,
                isLoading: false,
                isError: false,
            })

        render(<RecipeListClient />)

        await waitFor(() => {
            expect(mockFetchNextPage).toHaveBeenCalled()
        })
    })
})
