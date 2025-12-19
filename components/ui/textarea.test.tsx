import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './textarea'

describe('Textarea', () => {
    it('renders correctly', () => {
        render(<Textarea placeholder="Enter text" />)
        const textarea = screen.getByPlaceholderText('Enter text')
        expect(textarea).toBeInTheDocument()
        expect(textarea).toHaveClass('flex min-h-[80px] w-full')
    })

    it('handles value and onChange', () => {
        const handleChange = jest.fn()
        render(<Textarea value="test" onChange={handleChange} />)
        const textarea = screen.getByDisplayValue('test')
        expect(textarea).toBeInTheDocument()

        fireEvent.change(textarea, { target: { value: 'new value' } })
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
        render(<Textarea disabled placeholder="Disabled" />)
        const textarea = screen.getByPlaceholderText('Disabled')
        expect(textarea).toBeDisabled()
    })
})
