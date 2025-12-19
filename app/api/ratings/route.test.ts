/**
 * @jest-environment node
 */

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/ratings', () => {
    let POST: any
    let mockUpsert: jest.Mock
    let mockFrom: jest.Mock
    let getUserFromRequest: jest.Mock
    let getSupabaseUserFromFirebaseUid: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        // Setup mocks
        mockUpsert = jest.fn().mockResolvedValue({ error: null })
        mockFrom = jest.fn().mockReturnValue({ upsert: mockUpsert })

        getUserFromRequest = jest.fn()
        getSupabaseUserFromFirebaseUid = jest.fn()

        // Mock dependencies
        jest.doMock('@/lib/auth/requireAuth', () => ({
            getUserFromRequest,
            getSupabaseUserFromFirebaseUid,
        }))

        jest.doMock('@supabase/supabase-js', () => ({
            createClient: jest.fn(() => ({
                from: mockFrom,
            })),
        }))

        // Import route
        const route = require('./route')
        POST = route.POST
    })

    it('returns 401 if unauthorized', async () => {
        getUserFromRequest.mockResolvedValue(null)

        const request = new Request('http://localhost/api/ratings', {
            method: 'POST',
        })
        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('returns 400 if fields are missing', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const request = new Request('http://localhost/api/ratings', {
            method: 'POST',
            body: JSON.stringify({ recipeId: 'rec1' }), // Missing rating
        })
        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('upserts rating successfully', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const request = new Request('http://localhost/api/ratings', {
            method: 'POST',
            body: JSON.stringify({ recipeId: 'rec1', rating: 5 }),
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockUpsert).toHaveBeenCalledWith(
            { recipe_id: 'rec1', user_id: 'user1', rating: 5 },
            { onConflict: 'recipe_id,user_id' }
        )
    })

    it('returns 500 on database error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })
        mockUpsert.mockResolvedValue({ error: { message: 'DB Error' } })

        const request = new Request('http://localhost/api/ratings', {
            method: 'POST',
            body: JSON.stringify({ recipeId: 'rec1', rating: 5 }),
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('DB Error')
    })
})
