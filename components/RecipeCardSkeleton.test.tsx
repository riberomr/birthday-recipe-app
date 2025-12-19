import { render } from '@testing-library/react'
import { RecipeCardSkeleton } from './RecipeCardSkeleton'

describe('RecipeCardSkeleton', () => {
    it('renders correctly', () => {
        const { container } = render(<RecipeCardSkeleton />)
        expect(container.firstChild).toHaveClass('card-base')
    })
})
