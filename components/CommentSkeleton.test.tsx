import { render } from '@testing-library/react'
import { CommentSkeleton } from './CommentSkeleton'

describe('CommentSkeleton', () => {
    it('renders correctly', () => {
        const { container } = render(<CommentSkeleton />)
        expect(container.firstChild).toHaveClass('flex', 'gap-4', 'p-4')
    })
})
