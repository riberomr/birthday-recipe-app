import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { useFirebaseAuth } from '@/features/auth/hooks/useAuth'
import { useProfile } from '@/hooks/queries/useProfile'

// Mock dependencies
jest.mock('@/features/auth/hooks/useAuth', () => ({
    useFirebaseAuth: jest.fn(),
}))

jest.mock('@/hooks/queries/useProfile', () => ({
    useProfile: jest.fn(),
}))

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useFirebaseAuth as jest.Mock).mockReturnValue({
                user: null,
                loading: true,
                loginWithGoogle: jest.fn(),
                logout: jest.fn(),
            })
            ; (useProfile as jest.Mock).mockReturnValue({
                data: null,
                isLoading: false,
            })
    })

    it('provides loading state initially', () => {
        const TestComponent = () => {
            const { isLoading } = useAuth()
            return <div>{isLoading ? 'Loading' : 'Loaded'}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('fetches profile when firebase user is present', async () => {
        const mockUser = {
            uid: '123',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: 'photo.jpg',
        }

        const mockProfile = {
            id: '1',
            firebase_uid: '123',
            email: 'test@example.com',
            full_name: 'Test Profile',
            avatar_url: 'avatar.jpg',
        }

            ; (useFirebaseAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                loading: false,
                loginWithGoogle: jest.fn(),
                logout: jest.fn(),
            })

            ; (useProfile as jest.Mock).mockReturnValue({
                data: mockProfile,
                isLoading: false,
            })

        const TestComponent = () => {
            const { profile, isLoading, firebaseUser } = useAuth()
            if (isLoading) return <div>Loading...</div>
            return (
                <div>
                    <span data-testid="profile-name">{profile?.full_name}</span>
                    <span data-testid="firebase-email">{firebaseUser?.email}</span>
                </div>
            )
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('profile-name')).toHaveTextContent('Test Profile')
            expect(screen.getByTestId('firebase-email')).toHaveTextContent('test@example.com')
        })

        expect(useProfile).toHaveBeenCalledWith('123')
    })

    it('handles logout', async () => {
        ; (useFirebaseAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
            loginWithGoogle: jest.fn(),
            logout: jest.fn(),
        })

        const TestComponent = () => {
            const { profile, isLoading } = useAuth()
            if (isLoading) return <div>Loading...</div>
            return <div>{profile ? 'Logged In' : 'Logged Out'}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('Logged Out')).toBeInTheDocument()
        })
    })

    it('throws error when useAuth is used outside AuthProvider', () => {
        const TestComponent = () => {
            useAuth()
            return <div>Test</div>
        }

        const consoleError = jest.spyOn(console, 'error').mockImplementation()

        expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider')

        consoleError.mockRestore()
    })
})
