import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './Navbar'
import { useAuth } from './AuthContext'
import { useSnackbar } from '@/components/ui/Snackbar'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('./AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/components/ui/Snackbar', () => ({
    useSnackbar: jest.fn(),
}))
jest.mock('@/components/theme-toggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}))
jest.mock('@/components/LoginButton', () => ({
    LoginButton: () => <div data-testid="login-button">Login Button</div>,
}))

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
    })),
}))

describe('Navbar', () => {
    const mockShowSnackbar = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ user: null })
            ; (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar })
    })

    it('renders correctly', () => {
        render(<Navbar />)
        expect(screen.getByText('Recetario La María')).toBeInTheDocument()
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
    })

    it('shows favorites button', () => {
        render(<Navbar />)
        expect(screen.getByText('Favoritos')).toBeInTheDocument()
    })

    it('shows error when clicking favorites if not logged in', () => {
        render(<Navbar />)
        fireEvent.click(screen.getByText('Favoritos'))
        expect(mockShowSnackbar).toHaveBeenCalledWith(expect.stringMatching(/iniciar sesión/i), 'error')
    })

    it('navigates to favorites if logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ user: { id: '1' } })
        render(<Navbar />)
        fireEvent.click(screen.getByText('Favoritos'))
        expect(mockPush).toHaveBeenCalledWith('/favorites')
    })

    it('shows create recipe button if logged in', () => {
        ; (useAuth as jest.Mock).mockReturnValue({ user: { id: '1' } })
        render(<Navbar />)
        expect(screen.getByText('Nueva Receta')).toBeInTheDocument()
    })

    it('hides create recipe button if not logged in', () => {
        render(<Navbar />)
        expect(screen.queryByText('Nueva Receta')).not.toBeInTheDocument()
    })
})
