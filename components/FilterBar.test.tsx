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
    UserSelect: ({ onChange, value }: any) => (
        <select data-testid="user-select" value={value || 'all'} onChange={(e) => onChange(e.target.value)}>
            <option value="all">All</option>
            <option value="user1">User 1</option>
        </select>
    ),
}))

jest.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
        div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
    },
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

    it('clears search filter', () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        const input = screen.getByPlaceholderText('Buscar recetas...')
        fireEvent.change(input, { target: { value: 'cake' } })
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

        expect(screen.getByText('cake')).toBeInTheDocument()

        const allButtons = screen.getAllByRole('button')
        fireEvent.click(allButtons[allButtons.length - 1])

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ search: '' }))
    })

    it('toggles tags', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            expect(screen.getByText('Tag 1')).toBeInTheDocument()
        })

        // Select
        fireEvent.click(screen.getByText('Tag 1'))

        // Deselect (without closing)
        fireEvent.click(screen.getByText('Tag 1'))

        fireEvent.click(screen.getByText('Aplicar Filtros'))
        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ tags: [] }))
    })

    it('clears all filters', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Category 1'))
        })

        fireEvent.click(screen.getByText('Limpiar'))
        fireEvent.click(screen.getByText('Aplicar Filtros'))

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: '' }))
    })

    it('selects and deselects difficulty and time', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Fácil'))
            fireEvent.click(screen.getByText('Rápidas (< 20 min)'))
        })

        // Deselect immediately
        fireEvent.click(screen.getByText('Fácil'))
        fireEvent.click(screen.getByText('Rápidas (< 20 min)'))

        fireEvent.click(screen.getByText('Aplicar Filtros'))

        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({
            difficulty: '',
            time: ''
        }))
    })

    it('selects user and then all users', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            expect(screen.getByTestId('user-select')).toBeInTheDocument()
        })

        fireEvent.change(screen.getByTestId('user-select'), { target: { value: 'user1' } })

        // Select All
        fireEvent.change(screen.getByTestId('user-select'), { target: { value: 'all' } })

        fireEvent.click(screen.getByText('Aplicar Filtros'))
        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ user_id: '' }))
    })

    it('locks body scroll on mobile', async () => {
        // Mock window.innerWidth
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })

        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        expect(document.body.style.overflow).toBe('hidden')

        fireEvent.click(screen.getByText('Aplicar Filtros')) // Closes modal
        expect(document.body.style.overflow).toBe('unset')
    })

    it('toggles category off', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)
        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Category 1')) // Select
        })

        // Click "Todas" to clear category
        fireEvent.click(screen.getByText('Todas'))

        fireEvent.click(screen.getByText('Aplicar Filtros'))
        expect(mockOnFilterChange).toHaveBeenCalledWith(expect.objectContaining({ category: '' }))
    })

    it('handles null data from API', async () => {
        // Mock null response
        const mockSelect = jest.fn().mockResolvedValue({ data: null })
            ; (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect })
            ; (getUsersWithRecipes as jest.Mock).mockResolvedValue(null)

        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)

        // Should render without crashing
        expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('updates badge count correctly', async () => {
        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)

        // Initially no badge
        const filterBtn = screen.getByText('Filtros').closest('button')
        expect(filterBtn).not.toHaveTextContent('1')

        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            fireEvent.click(screen.getByText('Category 1'))
        })

        fireEvent.click(screen.getByText('Aplicar Filtros'))

        // Should have badge 1
        await waitFor(() => {
            const btn = screen.getByRole('button', { name: /filtros/i })
            expect(btn).toHaveTextContent('1')
        })
    })

    it('counts active tags in badge', async () => {
        (supabase.from as jest.Mock).mockImplementation((table: string) => {
            if (table === 'tags') {
                return {
                    select: jest.fn().mockResolvedValue({
                        data: [{ id: 'tag1', name: 'Tag 1', type: 'recipe' }],
                    }),
                }
            }
            return { select: jest.fn().mockResolvedValue({ data: [] }) }
        })

        render(<FilterBar categories={mockCategories} onFilterChange={mockOnFilterChange} />)

        fireEvent.click(screen.getByText('Filtros'))

        await waitFor(() => {
            expect(screen.getByText('Tag 1')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Tag 1'))
        fireEvent.click(screen.getByText('Aplicar Filtros'))

        const btn = screen.getByRole('button', { name: /filtros/i })
        expect(btn).toHaveTextContent('1')
    })
})
