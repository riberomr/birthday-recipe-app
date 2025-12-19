import { render, screen, fireEvent } from '@testing-library/react'
import { CategorySelect } from './CategorySelect'

const mockCategories = [
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
]

describe('CategorySelect', () => {
    it('renders correctly with categories', () => {
        render(
            <CategorySelect
                categories={mockCategories}
                selectedCategory={null}
                onSelect={jest.fn()}
            />
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
        expect(screen.getByText('Category 1')).toBeInTheDocument()
        expect(screen.getByText('Category 2')).toBeInTheDocument()
    })

    it('handles selection change', () => {
        const handleSelect = jest.fn()
        render(
            <CategorySelect
                categories={mockCategories}
                selectedCategory={null}
                onSelect={handleSelect}
            />
        )

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } })
        expect(handleSelect).toHaveBeenCalledWith('1')
    })

    it('handles empty selection (all categories)', () => {
        const handleSelect = jest.fn()
        render(
            <CategorySelect
                categories={mockCategories}
                selectedCategory="1"
                onSelect={handleSelect}
            />
        )

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } })
        expect(handleSelect).toHaveBeenCalledWith(null)
    })

    it('shows selected category', () => {
        render(
            <CategorySelect
                categories={mockCategories}
                selectedCategory="2"
                onSelect={jest.fn()}
            />
        )

        expect(screen.getByRole('combobox')).toHaveValue('2')
    })
})
