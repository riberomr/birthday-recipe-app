import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('bg-primary')
    })

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>)
        expect(screen.getByRole('button')).toHaveClass('bg-destructive')

        rerender(<Button variant="outline">Outline</Button>)
        expect(screen.getByRole('button')).toHaveClass('border-input')

        rerender(<Button variant="ghost">Ghost</Button>)
        expect(screen.getByRole('button')).not.toHaveClass('bg-primary')
    })

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-9')

        rerender(<Button size="lg">Large</Button>)
        expect(screen.getByRole('button')).toHaveClass('h-14')
    })

    it('handles click events', () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Click me</Button>)
        fireEvent.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('renders as child using Slot', () => {
        render(
            <Button asChild>
                <a href="/link">Link Button</a>
            </Button>
        )
        const link = screen.getByRole('link', { name: /link button/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/link')
        expect(link).toHaveClass('bg-primary')
    })
})
