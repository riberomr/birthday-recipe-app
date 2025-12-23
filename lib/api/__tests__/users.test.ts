import { initProfile, getUsers, getUsersWithRecipes, getUserProfile, updateUserProfile } from '../users'
import { User } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'

// Mock fetch
global.fetch = jest.fn()

// Mock Firebase auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null,
    },
}))

describe('initProfile', () => {
    const mockUser = {
        uid: 'test-uid',
        getIdToken: jest.fn().mockResolvedValue('test-token'),
    } as unknown as User

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns null if user is null', async () => {
        const result = await initProfile(null)
        expect(result).toBeNull()
    })

    it('returns user profile on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ user: { id: '1', firebase_uid: 'test-uid' } }),
        })

        const result = await initProfile(mockUser)
        expect(result).toEqual({ id: '1', firebase_uid: 'test-uid' })
        expect(mockUser.getIdToken).toHaveBeenCalled()
        expect(global.fetch).toHaveBeenCalledWith('/api/me', expect.objectContaining({
            headers: expect.objectContaining({
                'Authorization': 'Bearer test-token'
            })
        }))
    })

    it('returns null if fetch fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
        })

        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await initProfile(mockUser)
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalledWith('Error initializing user profile')
        consoleError.mockRestore()
    })

    it('returns null if fetch throws', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await initProfile(mockUser)
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalledWith('Network error')
        consoleError.mockRestore()
    })

    it('returns null if json parsing fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => { throw new Error('Invalid JSON') },
        })

        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await initProfile(mockUser)
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalledWith('Invalid JSON')
        consoleError.mockRestore()
    })

    it('logs default error if exception message is missing', async () => {
        (global.fetch as jest.Mock).mockRejectedValue({})

        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await initProfile(mockUser)
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalledWith('Error initializing user profile')
        consoleError.mockRestore()
    })

    it('returns null if json.user is missing', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        })

        const result = await initProfile(mockUser)
        expect(result).toBeNull()
    })
})

describe('getUsers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns users on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: '1' }] }),
        })

        const result = await getUsers()
        expect(result).toEqual([{ id: '1' }])
        expect(global.fetch).toHaveBeenCalledWith('/api/users')
    })

    it('returns empty array on error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUsers()
        expect(result).toEqual([])
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('returns empty array on exception', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUsers()
        expect(result).toEqual([])
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('returns empty array if data is null', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: null }),
        })
        const result = await getUsers()
        expect(result).toEqual([])
    })
})

describe('getUsersWithRecipes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns users with recipes on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: [{ id: '1', recipe_count: 5 }] }),
        })

        const result = await getUsersWithRecipes()
        expect(result).toEqual([{ id: '1', recipe_count: 5 }])
        expect(global.fetch).toHaveBeenCalledWith('/api/users?withRecipes=true')
    })

    it('returns empty array on error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUsersWithRecipes()
        expect(result).toEqual([])
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('returns empty array on exception', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUsersWithRecipes()
        expect(result).toEqual([])
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('returns empty array if data is null', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: null }),
        })
        const result = await getUsersWithRecipes()
        expect(result).toEqual([])
    })
})

describe('getUserProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns profile on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: { id: '1' } }),
        })

        const result = await getUserProfile('uid-123')
        expect(result).toEqual({ id: '1' })
        expect(global.fetch).toHaveBeenCalledWith('/api/users/uid-123')
    })

    it('returns null on error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: false })
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUserProfile('uid-123')
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it('returns null on exception', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
        const consoleError = jest.spyOn(console, 'error').mockImplementation()
        const result = await getUserProfile('uid-123')
        expect(result).toBeNull()
        expect(consoleError).toHaveBeenCalled()
        consoleError.mockRestore()
    })
})

describe('updateUserProfile', () => {
    const mockUser = {
        getIdToken: jest.fn().mockResolvedValue('test-token'),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // @ts-ignore
        auth.currentUser = mockUser
    })

    it('throws if user not authenticated', async () => {
        // @ts-ignore
        auth.currentUser = null
        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('User not authenticated')
    })

    it('updates profile on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: { id: '1', name: 'Updated' } }),
        })

        const result = await updateUserProfile('uid-123', { full_name: 'Updated' })
        expect(result).toEqual({ id: '1', name: 'Updated' })
        expect(global.fetch).toHaveBeenCalledWith('/api/users/uid-123', expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ full_name: 'Updated' })
        }))
    })

    it('throws on API error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'Update failed' }),
        })

        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('Update failed')
    })

    it('throws on JSON parse error', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => { throw new Error('Invalid JSON') },
        })

        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('Error al procesar la respuesta del servidor')
    })

    it('throws on network error', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('Network error')
    })

    it('throws default error if API error message is missing', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: async () => ({}),
        })

        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('Error updating user profile')
    })

    it('throws default error if network error message is missing', async () => {
        (global.fetch as jest.Mock).mockRejectedValue({})
        await expect(updateUserProfile('uid-123', {})).rejects.toThrow('Error updating user profile')
    })
})
