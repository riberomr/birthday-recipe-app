import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '../UserMenu'
import { useAuth } from '../AuthContext'
import { useRouter, usePathname } from 'next/navigation'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
    usePathname: jest.fn(),
}))

// Mocking ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// Mocking pointer capture methods
Element.prototype.setPointerCapture = jest.fn()
Element.prototype.releasePointerCapture = jest.fn()
Element.prototype.hasPointerCapture = jest.fn()

describe('UserMenu', () => {
    const mockLogout = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({
                user: { displayName: 'John Doe', photoURL: 'photo.jpg' },
                logout: mockLogout,
            })
            ; (usePathname as jest.Mock).mockReturnValue('/')
    })

    it('renders correctly when logged in', () => {
        render(<UserMenu />)
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByRole('img')).toHaveAttribute('src', 'photo.jpg')
    })

    it('does not render when not logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ user: null })
        render(<UserMenu />)
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('renders fallback photo and name', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: { displayName: null, photoURL: null },
            logout: mockLogout,
        })
        render(<UserMenu />)
        // Fallback is only for alt text, displayName span will be empty
        expect(screen.getByRole('img')).toHaveAttribute('alt', 'User')
        expect(screen.getByRole('img')).toHaveAttribute('src', 'https://api.dicebear.com/7.x/avataaars/svg?seed=default')
    })

    it('navigates to My Recipes', async () => {
        const user = userEvent.setup()
        render(<UserMenu />)

        await user.click(screen.getByText('John Doe')) // Open menu

        const item = await screen.findByText('Mis Recetas')
        await user.click(item)

        expect(mockPush).toHaveBeenCalledWith('/recipes/me')
    })

    it('navigates to Favorites', async () => {
        const user = userEvent.setup()
        render(<UserMenu />)

        await user.click(screen.getByText('John Doe')) // Open menu

        const item = await screen.findByText('Favoritos')
        await user.click(item)

        expect(mockPush).toHaveBeenCalledWith('/favorites')
    })

    it('calls logout', async () => {
        const user = userEvent.setup()
        render(<UserMenu />)

        await user.click(screen.getByText('John Doe')) // Open menu

        const item = await screen.findByText('Cerrar Sesión')
        await user.click(item)

        expect(mockLogout).toHaveBeenCalled()
    })

    it('disables logout when creating recipe', async () => {
        const user = userEvent.setup()
            ; (usePathname as jest.Mock).mockReturnValue('/recipes/create')
        render(<UserMenu />)

        await user.click(screen.getByText('John Doe')) // Open menu

        const item = await screen.findByText('Cerrar Sesión')

        // In Radix UI, disabled items might not receive click events or might have aria-disabled
        // Let's try to click it and assert logout is not called
        await user.click(item)

        expect(mockLogout).not.toHaveBeenCalled()
    })
})
