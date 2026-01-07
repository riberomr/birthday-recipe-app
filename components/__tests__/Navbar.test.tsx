import { render, screen } from '@testing-library/react'
import { Navbar } from '../Navbar'
import { useAuth } from '../AuthContext'

// Mock dependencies
jest.mock('../AuthContext', () => ({
    useAuth: jest.fn(),
}))
jest.mock('@/components/ProfileMenu', () => ({
    ProfileMenu: () => <div data-testid="profile-menu">Profile Menu</div>,
}))

describe('Navbar', () => {

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useAuth as jest.Mock).mockReturnValue({ profile: null })
    })

    it('renders correctly', () => {
        render(<Navbar />)
        expect(screen.getByText('Recetario La María')).toBeInTheDocument()
        expect(screen.getByTestId('profile-menu')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Recetario La María/i })).toHaveAttribute('href', '/recipes')
    })
})
