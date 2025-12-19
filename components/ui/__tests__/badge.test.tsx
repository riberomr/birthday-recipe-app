import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '../badge'

describe('Badge', () => {
    it('exports badgeVariants', () => {
        expect(badgeVariants).toBeDefined()
    })
    it('renders correctly with default props', () => {
        render(<Badge>Default</Badge>)
        const badge = screen.getByText('Default')
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('bg-primary')
    })

    it('renders with different variants', () => {
        const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)
        expect(screen.getByText('Secondary')).toHaveClass('bg-secondary')

        rerender(<Badge variant="destructive">Destructive</Badge>)
        expect(screen.getByText('Destructive')).toHaveClass('bg-destructive')

        rerender(<Badge variant="outline">Outline</Badge>)
        expect(screen.getByText('Outline')).toHaveClass('text-foreground')
    })

    it('applies custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>)
        expect(screen.getByText('Custom')).toHaveClass('custom-class')
    })
})
