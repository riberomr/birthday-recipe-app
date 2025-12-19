import { getUserRating, upsertRating } from '../ratings'
import { auth } from '@/lib/firebase/client'
import { supabase } from '@/lib/supabase/client'

// Mock Firebase Auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn()
        }))
    }
}))

// Mock global fetch
global.fetch = jest.fn()

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
            const mockSingle = jest.fn().mockResolvedValue({ data: { rating: 5 }, error: null })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const rating = await getUserRating('user1', 'recipe1')
            expect(rating).toBe(5)
            expect(supabase.from).toHaveBeenCalledWith('ratings')
        })

        it('returns 0 when not found (PGRST116)', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const rating = await getUserRating('user1', 'recipe1')
            expect(rating).toBe(0)
        })

        it('throws error on other database errors', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'OTHER_ERROR', message: 'DB Error' } })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            await expect(getUserRating('user1', 'recipe1')).rejects.toEqual({ code: 'OTHER_ERROR', message: 'DB Error' })
        })
    })

    describe('upsertRating', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            await expect(upsertRating('user1', 'recipe1', 5)).rejects.toThrow('User not authenticated')
        })

        it('saves rating successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true
            })

            await upsertRating('user1', 'recipe1', 5)

            expect(global.fetch).toHaveBeenCalledWith('/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                },
                body: JSON.stringify({ recipeId: 'recipe1', rating: 5 })
            })
        })

        it('throws error on save failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false
            })

            await expect(upsertRating('user1', 'recipe1', 5)).rejects.toThrow('Error saving rating')
        })
    })
})
