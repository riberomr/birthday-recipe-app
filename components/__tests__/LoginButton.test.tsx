import { render, screen, fireEvent } from '@testing-library/react'
import { LoginButton } from '../LoginButton'
import { useAuth } from '../AuthContext'
import { useModal } from '@/hooks/ui/useModal'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/hooks/ui/useModal', () => ({
    useModal: jest.fn(),
}))
jest.mock('../UserMenu', () => ({
    UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}))

describe('LoginButton', () => {
    const mockLogin = jest.fn()
    const mockOpen = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useModal as jest.Mock).mockReturnValue({ open: mockOpen })
    })

    it('renders login button when not authenticated', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: null,
            login: mockLogin,
            isLoading: false,
        })

        render(<LoginButton />)
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('renders user menu when authenticated', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: { uid: '123' },
            login: mockLogin,
            isLoading: false,
        })

        render(<LoginButton />)
        expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    it('renders loading state', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: null,
            login: mockLogin,
            isLoading: true,
        })

        render(<LoginButton />)
        expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
    })

    it('opens modal on click', () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: null,
            login: mockLogin,
            isLoading: false,
        })

        render(<LoginButton />)
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
        expect(mockOpen).toHaveBeenCalled()
    })

    it('calls login when modal is confirmed', async () => {
        ; (useAuth as jest.Mock).mockReturnValue({
            user: null,
            login: mockLogin,
            isLoading: false,
        })

        let onConfirmCallback: (() => Promise<void>) | undefined
            ; (useModal as jest.Mock).mockReturnValue({
                open: jest.fn((config: any) => {
                    onConfirmCallback = config.onConfirm
                })
            })

        render(<LoginButton />)
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

        // Execute the onConfirm callback
        if (onConfirmCallback) {
            await onConfirmCallback()
            expect(mockLogin).toHaveBeenCalled()
        }
    })
})
