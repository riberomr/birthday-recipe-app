import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FilterBar } from './FilterBar'
import { supabase } from '@/lib/supabase/client'
import { getUsersWithRecipes } from '@/lib/api/users'

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockResolvedValue({ data: [{ id: 'tag1', name: 'Tag 1' }] }),
        })),
    },
}))
jest.mock('@/lib/api/users', () => ({
    getUsersWithRecipes: jest.fn().mockResolvedValue([{ id: 'user1', full_name: 'User 1' }]),
}))
jest.mock('./UserSelect', () => ({
    UserSelect: ({ onChange }: any) => (
        <select data-testid="user-select" onChange={(e) => onChange(e.target.value)}>
            <option value="">All</option>
            <option value="user1">User 1</option>
        </select>
    ),
}))

const mockCategories = [{ id: 'cat1', name: 'Category 1' }]

describe('FilterBar', () => {
    const mockOnFilterChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly', () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        expect(screen.getByPlaceholderText('Buscar recetas...')).toBeInTheDocument()
        expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('opens filter modal', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            expect(screen.getByText('Categoría')).toBeInTheDocument()
        })
    })

    it('applies filters', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Category 1'))
        })

        fireEvent.click(screen.getByText('Aplicar Filtros'))

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: 'cat1' }))
    })

    it('handles search input', () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        const input = screen.getByPlaceholderText('Buscar recetas...')
        fireEvent.change(input, { target: { value: 'cake' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'cake' }))
    })
})
