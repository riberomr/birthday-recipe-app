import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../input'

describe('Input', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Enter text" />)
        const input = screen.getByPlaceholderText('Enter text')
        expect(input).toBeInTheDocument()
        expect(input).toHaveClass('flex h-10 w-full')
    })

    it('handles type prop', () => {
        render(<Input type="password" placeholder="Password" />)
        const input = screen.getByPlaceholderText('Password')
        expect(input).toHaveAttribute('type', 'password')
    })

    it('handles value and onChange', () => {
        const handleChange = jest.fn()
        render(<Input value="test" onChange={handleChange} />)
        const input = screen.getByDisplayValue('test')
        expect(input).toBeInTheDocument()

        fireEvent.change(input, { target: { value: 'new value' } })
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
        render(<Input disabled placeholder="Disabled" />)
        const input = screen.getByPlaceholderText('Disabled')
        expect(input).toBeDisabled()
    })
})
