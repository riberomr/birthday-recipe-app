import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecipeListClient } from './RecipeListClient'
import { getRecipes } from '@/lib/api/recipes'

// Mock dependencies
jest.mock('@/lib/api/recipes', () => ({
    getRecipes: jest.fn(),
}))
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
// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

const mockRecipes = [
    { id: '1', title: 'Recipe 1' },
    { id: '2', title: 'Recipe 2' },
]

describe('RecipeListClient', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: [], total: 0 })
    })

    it('renders initial recipes', () => {
        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={2} categories={[]} />)
        expect(screen.getByText('Recipe 1')).toBeInTheDocument()
        expect(screen.getByText('Recipe 2')).toBeInTheDocument()
    })

    it('renders empty state', async () => {
        render(<RecipeListClient initialRecipes={[]} initialTotal={0} categories={[]} />)
        expect(await screen.findByText('No se encontraron recetas 🍰')).toBeInTheDocument()
    })

    it('filters recipes', async () => {
        ; (getRecipes as jest.Mock).mockResolvedValue({
            recipes: [{ id: '3', title: 'Filtered Recipe' }],
            total: 1,
        })

        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={2} categories={[]} />)

        fireEvent.click(screen.getByText('Filter'))

        await waitFor(() => {
            expect(getRecipes).toHaveBeenCalledWith(1, 6, expect.objectContaining({ search: 'test' }))
            expect(screen.getByText('Filtered Recipe')).toBeInTheDocument()
        })
    })
})
