import { getFavorites, checkIsFavorite, toggleFavorite } from '../favorites'
import { auth } from '@/lib/firebase/client'

// Mock Firebase Auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
}))

// Mock global fetch
global.fetch = jest.fn()

describe('lib/api/favorites', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset auth mock
        Object.defineProperty(auth, 'currentUser', {
            value: { getIdToken: jest.fn().mockResolvedValue('mock-token') },
            writable: true
        })
    })

    describe('getFavorites', () => {
        it('fetches favorites successfully', async () => {
            const mockFavorites = [{ id: '1', title: 'Recipe 1' }]
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockFavorites
                })

            const result = await getFavorites('user1')
            expect(global.fetch).toHaveBeenCalledWith('/api/favorites?userId=user1')
            expect(result).toEqual(mockFavorites)
        })

        it('throws error on fetch failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false
            })

            await expect(getFavorites('user1')).rejects.toThrow('Error fetching favorites')
        })
    })

    describe('checkIsFavorite', () => {
        it('returns true if recipe is in favorites', async () => {
            const mockFavorites = [{ id: '1', title: 'Recipe 1' }]
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockFavorites
                })

            const result = await checkIsFavorite('user1', '1')
            expect(result).toBe(true)
        })

        it('returns false if recipe is not in favorites', async () => {
            const mockFavorites = [{ id: '1', title: 'Recipe 1' }]
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockFavorites
                })

            const result = await checkIsFavorite('user1', '2')
            expect(result).toBe(false)
        })
    })

    describe('toggleFavorite', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            await expect(toggleFavorite('user1', '1', true)).rejects.toThrow('User not authenticated')
        })

        it('toggles favorite successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ isFavorite: true })
            })

            const result = await toggleFavorite('user1', '1', false)

            expect(global.fetch).toHaveBeenCalledWith('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ recipeId: '1' })
            })
            expect(result).toBe(true)
        })

        it('throws error on toggle failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false
            })

            await expect(toggleFavorite('user1', '1', false)).rejects.toThrow('Error toggling favorite')
        })
    })
})
