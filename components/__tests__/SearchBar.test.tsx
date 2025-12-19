import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
    it('renders correctly', () => {
        render(<SearchBar value="" onChange={jest.fn()} />)
        expect(screen.getByPlaceholderText('Buscar recetas...')).toBeInTheDocument()
    })

    it('handles input change', () => {
        const handleChange = jest.fn()
        render(<SearchBar value="" onChange={handleChange} />)

        const input = screen.getByPlaceholderText('Buscar recetas...')
        fireEvent.change(input, { target: { value: 'pizza' } })
        expect(handleChange).toHaveBeenCalledWith('pizza')
    })

    it('displays the current value', () => {
        render(<SearchBar value="cake" onChange={jest.fn()} />)
        expect(screen.getByDisplayValue('cake')).toBeInTheDocument()
    })
})
