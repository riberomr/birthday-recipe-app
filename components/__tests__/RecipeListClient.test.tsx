import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RecipeListClient } from '../RecipeListClient'
import { getRecipes } from '@/lib/api/recipes'
import { useInView } from 'framer-motion'

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
    beforeEach(() => {
        jest.clearAllMocks()
            ; (getRecipes as jest.Mock).mockResolvedValue({ recipes: [], total: 0 })
            ; (useInView as jest.Mock).mockReturnValue(false)
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

        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles filter error', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (getRecipes as jest.Mock).mockRejectedValue(new Error('Filter failed'))

        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={2} categories={[]} />)

        fireEvent.click(screen.getByText('Filter'))

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Error filtering recipes:', expect.any(Error))
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        consoleError.mockRestore()
    })

    it('loads more recipes when button clicked', async () => {
        ; (getRecipes as jest.Mock).mockResolvedValue({
            recipes: [{ id: '3', title: 'Recipe 3' }],
            total: 3,
        })

        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={3} categories={[]} />)

        const loadMoreButton = await screen.findByText('Cargar más')
        fireEvent.click(loadMoreButton)

        await waitFor(() => {
            expect(getRecipes).toHaveBeenCalledWith(2, 6, expect.any(Object))
        })

        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('handles load more error', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
            ; (getRecipes as jest.Mock).mockRejectedValue(new Error('Load failed'))

        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={3} categories={[]} />)

        const loadMoreButton = await screen.findByText('Cargar más')
        fireEvent.click(loadMoreButton)

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Error loading more recipes:', expect.any(Error))
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        consoleError.mockRestore()
    })

    it('triggers load more when in view', async () => {
        // Mock useInView to return true
        ; (useInView as jest.Mock).mockReturnValue(true)

            ; (getRecipes as jest.Mock).mockImplementation((page) => {
                if (page === 1) return Promise.resolve({ recipes: mockRecipes, total: 3 })
                if (page === 2) return Promise.resolve({ recipes: [{ id: '3', title: 'Recipe 3' }], total: 3 })
                return Promise.resolve({ recipes: [], total: 3 })
            })

        render(<RecipeListClient initialRecipes={mockRecipes as any} initialTotal={3} categories={[]} />)

        await waitFor(() => {
            expect(getRecipes).toHaveBeenCalledWith(2, 6, expect.any(Object))
        })

        // Wait for state update
        await screen.findByText('Recipe 3')

        await new Promise(resolve => setTimeout(resolve, 0))
    })
})
