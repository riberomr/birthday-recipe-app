import { renderHook, act, waitFor } from '@testing-library/react'
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User,
} from 'firebase/auth'
import { useFirebaseAuth } from './useAuth'
import { auth } from '@/lib/firebase/client'

// ---------- Mocks ----------

jest.mock('@/lib/firebase/client', () => ({
    auth: {},
}))

jest.mock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    GoogleAuthProvider: jest.fn(),
}))

const mockUser = { uid: '123', email: 'test@test.com' } as User

describe('useFirebaseAuth', () => {
    let unsubscribeMock: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        unsubscribeMock = jest.fn()
    })

    // ---------------------------
    // Auth state handling
    // ---------------------------

    it('starts with loading true and user null', () => {
        (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock)

        const { result } = renderHook(() => useFirebaseAuth())

        expect(result.current.user).toBeNull()
        expect(result.current.loading).toBe(true)
    })

    it('sets user and loading false when auth state changes', async () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation(
            (_auth, callback) => {
                callback(mockUser)
                return unsubscribeMock
            }
        )

        const { result } = renderHook(() => useFirebaseAuth())

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser)
            expect(result.current.loading).toBe(false)
        })
    })

    it('sets user null when auth state is null', async () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation(
            (_auth, callback) => {
                callback(null)
                return unsubscribeMock
            }
        )

        const { result } = renderHook(() => useFirebaseAuth())

        await waitFor(() => {
            expect(result.current.user).toBeNull()
            expect(result.current.loading).toBe(false)
        })
    })

    it('unsubscribes on unmount', () => {
        ; (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock)

        const { unmount } = renderHook(() => useFirebaseAuth())

        unmount()

        expect(unsubscribeMock).toHaveBeenCalled()
    })

    // ---------------------------
    // Login
    // ---------------------------

    it('logs in with Google successfully', async () => {
        ; (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock)
            ; (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser })

        const { result } = renderHook(() => useFirebaseAuth())

        await act(async () => {
            await result.current.loginWithGoogle()
        })

        expect(GoogleAuthProvider).toHaveBeenCalledTimes(1)
        expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.any(GoogleAuthProvider))
    })

    it('throws error if login with Google fails', async () => {
        ; (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock)
        const error = new Error('Login failed')
            ; (signInWithPopup as jest.Mock).mockRejectedValue(error)

        const { result } = renderHook(() => useFirebaseAuth())

        await expect(
            act(async () => {
                await result.current.loginWithGoogle()
            })
        ).rejects.toThrow('Login failed')
    })

    // ---------------------------
    // Logout
    // ---------------------------

    it('logs out successfully and clears user', async () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation(
            (_auth, callback) => {
                callback(mockUser)
                return unsubscribeMock
            }
        )
            ; (signOut as jest.Mock).mockResolvedValue(undefined)

        const { result } = renderHook(() => useFirebaseAuth())

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser)
        })

        await act(async () => {
            await result.current.logout()
        })

        expect(signOut).toHaveBeenCalledWith(auth)
        expect(result.current.user).toBeNull()
    })

    it('throws error if logout fails', async () => {
        ; (onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribeMock)
        const error = new Error('Logout failed')
            ; (signOut as jest.Mock).mockRejectedValue(error)

        const { result } = renderHook(() => useFirebaseAuth())

        await expect(
            act(async () => {
                await result.current.logout()
            })
        ).rejects.toThrow('Logout failed')
    })
})