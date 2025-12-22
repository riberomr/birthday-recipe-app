import { getUsers, getUsersWithRecipes, getUserProfile, updateUserProfile } from '../users'
import { auth } from '@/lib/firebase/client'

// Mock Firebase Auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: {
            getIdToken: jest.fn().mockResolvedValue('mock-token')
        }
    }
}))

// Mock global fetch
global.fetch = jest.fn()

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
    console.error = jest.fn()
})
afterAll(() => {
    console.error = originalConsoleError
})

describe('lib/api/users', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUsers', () => {
        it('fetches users successfully', async () => {
            const mockUsers = [{ id: '1', full_name: 'User 1' }]
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockUsers })
                })

            const result = await getUsers()

            expect(global.fetch).toHaveBeenCalledWith('/api/users')
            expect(result).toEqual(mockUsers)
        })

        it('returns empty array on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getUsers()

            expect(console.error).toHaveBeenCalledWith('Error fetching users')
            expect(result).toEqual([])
        })
    })

    describe('getUsersWithRecipes', () => {
        it('fetches users with recipes successfully', async () => {
            const mockUsers = [{ id: '1', full_name: 'User 1', recipe_count: 5 }]
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockUsers })
                })

            const result = await getUsersWithRecipes()

            expect(global.fetch).toHaveBeenCalledWith('/api/users?withRecipes=true')
            expect(result).toEqual(mockUsers)
        })

        it('returns empty array on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getUsersWithRecipes()

            expect(console.error).toHaveBeenCalledWith('Error fetching users with recipes')
            expect(result).toEqual([])
        })
    })

    describe('getUserProfile', () => {
        it('fetches user profile successfully', async () => {
            const mockUser = { id: '1', full_name: 'Test User' }
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockUser })
                })

            const result = await getUserProfile('fb1')

            expect(global.fetch).toHaveBeenCalledWith('/api/users/fb1')
            expect(result).toEqual(mockUser)
        })

        it('returns null on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getUserProfile('fb1')

            expect(console.error).toHaveBeenCalledWith('Error fetching user profile')
            expect(result).toBeNull()
        })
    })

    describe('updateUserProfile', () => {
        it('updates user profile successfully', async () => {
            const mockUser = { id: '1', full_name: 'Updated User' }
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockUser })
                })

            const result = await updateUserProfile('fb1', { full_name: 'Updated User' })

            expect(global.fetch).toHaveBeenCalledWith('/api/users/fb1', expect.objectContaining({
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated User' }),
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                })
            }))
            expect(result).toEqual(mockUser)
        })

        it('throws error on update failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'Update Error' })
            })

            await expect(updateUserProfile('fb1', { full_name: 'Updated User' })).rejects.toThrow('Update Error')
        })

        it('throws error if user not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(updateUserProfile('fb1', { full_name: 'Updated User' })).rejects.toThrow('User not authenticated')
        })

        it('throws default error on update failure without message', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: async () => ({})
            })

            // @ts-ignore
            auth.currentUser = { getIdToken: jest.fn().mockResolvedValue('token') }

            await expect(updateUserProfile('fb1', { full_name: 'Updated User' })).rejects.toThrow('Error updating user profile')
        })
    })

    it('getUsers returns empty array if data is null', async () => {
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: null })
        })

        const result = await getUsers()
        expect(result).toEqual([])
    })

    it('getUsersWithRecipes returns empty array if data is null', async () => {
        ; (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: null })
        })

        const result = await getUsersWithRecipes()
        expect(result).toEqual([])
    })
})
