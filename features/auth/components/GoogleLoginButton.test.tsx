import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleLoginButton } from './GoogleLoginButton'
import { useAuth } from '@/components/AuthContext'

jest.mock('@/components/AuthContext', () => ({
    useAuth: jest.fn()
}))

describe('GoogleLoginButton', () => {
    const mockLogin = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ login: mockLogin })
    })

    it('renders button with correct text', () => {
        render(<GoogleLoginButton />)

        expect(screen.getByRole('button', { name: /iniciar sesión con google/i })).toBeInTheDocument()
    })

    it('calls login when clicked', async () => {
        const user = userEvent.setup()
        render(<GoogleLoginButton />)

        const button = screen.getByRole('button', { name: /iniciar sesión con google/i })
        await user.click(button)

        expect(mockLogin).toHaveBeenCalledTimes(1)
    })
})
