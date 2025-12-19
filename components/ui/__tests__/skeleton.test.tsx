import { render, screen } from '@testing-library/react'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
    it('renders correctly', () => {
        render(<Skeleton data-testid="skeleton" />)
        const skeleton = screen.getByTestId('skeleton')
        expect(skeleton).toBeInTheDocument()
        expect(skeleton).toHaveClass('animate-pulse rounded-md bg-muted')
    })

    it('applies custom class names', () => {
        render(<Skeleton data-testid="skeleton" className="h-4 w-4" />)
        const skeleton = screen.getByTestId('skeleton')
        expect(skeleton).toHaveClass('h-4 w-4')
    })
})
