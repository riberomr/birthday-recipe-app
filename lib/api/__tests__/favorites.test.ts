import { getFavorites, toggleFavorite } from '../favorites'
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

        it('returns empty array on invalid JSON', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            const result = await getFavorites('user1')
            expect(result).toEqual([])
        })
    })

    describe('toggleFavorite', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            await expect(toggleFavorite('1')).rejects.toThrow('User not authenticated')
        })

        it('toggles favorite successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ isFavorite: true })
            })

            const result = await toggleFavorite('1')

            expect(global.fetch).toHaveBeenCalledWith('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ recipeId: '1' })
            })
            expect(result).toEqual({ isFavorite: true })
        })

        it('throws error on toggle failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false
            })

            await expect(toggleFavorite('1')).rejects.toThrow('Error toggling favorite')
        })

        it('throws error on invalid JSON', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            await expect(toggleFavorite('1')).rejects.toThrow('Error toggling favorite')
        })
    })
})
