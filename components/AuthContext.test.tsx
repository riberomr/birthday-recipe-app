import { render, screen, waitFor, renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { useFirebaseAuth } from '@/features/auth/hooks/useAuth'

// Mock dependencies
jest.mock('@/features/auth/hooks/useAuth', () => ({
    useFirebaseAuth: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useFirebaseAuth as jest.Mock).mockReturnValue({
                user: null,
                loading: true,
                loginWithGoogle: jest.fn(),
                logout: jest.fn(),
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

    it('fetches supabase user when firebase user is present', async () => {
        const mockUser = {
            uid: '123',
            getIdToken: jest.fn().mockResolvedValue('token'),
        }

            ; (useFirebaseAuth as jest.Mock).mockReturnValue({
                user: mockUser,
                loading: false,
                loginWithGoogle: jest.fn(),
                logout: jest.fn(),
            })

            ; (global.fetch as jest.Mock).mockResolvedValue({
                json: jest.fn().mockResolvedValue({ user: { id: '123', full_name: 'Test User' } }),
            })

        const TestComponent = () => {
            const { supabaseUser, isLoading } = useAuth()
            if (isLoading) return <div>Loading...</div>
            return <div>{supabaseUser?.full_name}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
        })

        expect(global.fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({
            headers: expect.objectContaining({
                'Authorization': 'Bearer token'
            })
        }))
    })

    it('handles logout', async () => {
        ; (useFirebaseAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
            loginWithGoogle: jest.fn(),
            logout: jest.fn(),
        })

        const TestComponent = () => {
            const { supabaseUser, isLoading } = useAuth()
            if (isLoading) return <div>Loading...</div>
            return <div>{supabaseUser ? 'Logged In' : 'Logged Out'}</div>
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
})
