import { getUserRating, upsertRating, getRecipeRating } from '../ratings'
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

// Mock console.error
const originalConsoleError = console.error
beforeAll(() => {
    console.error = jest.fn()
})
afterAll(() => {
    console.error = originalConsoleError
})

describe('lib/api/ratings', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset auth mock
        Object.defineProperty(auth, 'currentUser', {
            value: { getIdToken: jest.fn().mockResolvedValue('mock-token') },
            writable: true
        })
    })

    describe('getUserRating', () => {
        it('returns rating when found', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { rating: 5 } })
            })

            const rating = await getUserRating('recipe1')
            expect(rating).toBe(5)
            expect(global.fetch).toHaveBeenCalledWith('/api/ratings/recipe1/user', expect.objectContaining({
                headers: {
                    'Authorization': 'Bearer mock-token'
                }
            }))
        })

        it('returns 0 when not found (404)', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 404
            })

            const rating = await getUserRating('recipe1')
            expect(rating).toBe(0)
        })

        it('returns 0 when user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            const rating = await getUserRating('recipe1')
            expect(rating).toBe(0)
        })

        it('returns 0 on invalid JSON', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            const rating = await getUserRating('recipe1')
            expect(rating).toBe(0)
        })

        it('returns 0 if data is null', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: null })
            })

            const rating = await getUserRating('recipe1')
            expect(rating).toBe(0)
        })
    })

    describe('upsertRating', () => {
        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(upsertRating('recipe1', 5)).rejects.toThrow('User not authenticated')
        })

        it('saves rating successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await upsertRating('recipe1', 5)

            expect(global.fetch).toHaveBeenCalledWith('/api/ratings/recipe1/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ rating: 5 })
            })
        })

        it('throws error on save failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Error saving rating' })
            })

            await expect(upsertRating('recipe1', 5)).rejects.toThrow('Error saving rating')
        })

        it('throws default error if no error message from server', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            })

            await expect(upsertRating('recipe1', 5)).rejects.toThrow('Error saving rating')
        })

        it('throws error if response is not ok and json parsing fails', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => { throw new Error('Invalid JSON') }
            })

            await expect(upsertRating('recipe1', 5)).rejects.toThrow('Error saving rating')
        })

        it('throws error on invalid JSON response', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            await expect(upsertRating('recipe1', 5)).rejects.toThrow('Error saving rating: Invalid response')
        })

        it('throws generic error on network failure', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
            await expect(upsertRating('recipe1', 5)).rejects.toThrow('Error saving rating')
        })
    })

    describe('getRecipeRating', () => {
        it('returns average and count', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { average: 4.5, count: 2 } })
            })

            const result = await getRecipeRating('recipe1')
            expect(result).toEqual({ average: 4.5, count: 2 })
            expect(global.fetch).toHaveBeenCalledWith('/api/ratings/recipe1')
        })

        it('returns 0 when error occurs', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getRecipeRating('recipe1')
            expect(console.error).toHaveBeenCalledWith('Error fetching recipe rating')
            expect(result).toEqual({ average: 0, count: 0 })
        })

        it('returns 0 on invalid JSON', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            const result = await getRecipeRating('recipe1')
            expect(console.error).toHaveBeenCalledWith('Error parsing recipe rating response:', expect.any(Error))
            expect(result).toEqual({ average: 0, count: 0 })
        })

        it('returns default if data is null', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: null })
            })

            const result = await getRecipeRating('recipe1')
            expect(result).toEqual({ average: 0, count: 0 })
        })
    })
})
