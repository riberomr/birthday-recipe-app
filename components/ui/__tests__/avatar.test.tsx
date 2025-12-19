import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'

describe('Avatar', () => {
    it('renders correctly', () => {
        render(
            <Avatar>
                <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        )
        // Radix Avatar renders image if src is valid, otherwise fallback.
        // Since we can't easily simulate image loading in jsdom without more setup,
        // we check if elements are present in the DOM structure.

        // Note: Radix UI primitives might not render Image immediately if it waits for loading.
        // However, we can check if the components render their root elements.

        const avatar = screen.getByText('JD').closest('span') // Fallback is usually a span
        expect(avatar).toBeInTheDocument()
    })

    it('renders fallback when image is missing', () => {
        render(
            <Avatar>
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
        )
        expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('applies custom class names', () => {
        render(
            <Avatar className="custom-avatar">
                <AvatarFallback className="custom-fallback">JD</AvatarFallback>
            </Avatar>
        )
        const avatar = screen.getByText('JD').closest('.custom-avatar')
        expect(avatar).toBeInTheDocument()
        expect(screen.getByText('JD')).toHaveClass('custom-fallback')
    })
})
