import { renderHook, waitFor } from '@testing-library/react'
import { useInitProfile } from '../useInitProfile'
import { initProfile } from '@/lib/api/users'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { User } from 'firebase/auth'

// Mock dependencies
jest.mock('@/lib/api/users', () => ({
    initProfile: jest.fn(),
}))

const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
} as User

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useInitProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should be disabled when user is null', () => {
        const { result } = renderHook(() => useInitProfile(null), { wrapper })
        expect(result.current.fetchStatus).toBe('idle')
        expect(initProfile).not.toHaveBeenCalled()
    })

    it('should call initProfile with user when user is present', async () => {
        (initProfile as jest.Mock).mockResolvedValue({ id: 'profile-id', firebase_uid: 'test-uid' })

        const { result } = renderHook(() => useInitProfile(mockUser), { wrapper })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(initProfile).toHaveBeenCalledWith(mockUser)
        expect(result.current.data).toEqual({ id: 'profile-id', firebase_uid: 'test-uid' })
    })
})
