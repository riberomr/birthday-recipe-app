/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/favorites', () => {
    let GET: any
    let POST: any
    let mockChain: any
    let getUserFromRequest: jest.Mock
    let getSupabaseUserFromFirebaseUid: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        // Setup chainable mock
        mockChain = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ error: null }),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            data: null,
            error: null,
        }

        getUserFromRequest = jest.fn()
        getSupabaseUserFromFirebaseUid = jest.fn()

        // Mock dependencies
        jest.doMock('@/lib/auth/requireAuth', () => ({
            getUserFromRequest,
            getSupabaseUserFromFirebaseUid,
        }))

        jest.doMock('@supabase/supabase-js', () => ({
            createClient: jest.fn(() => ({
                from: jest.fn(() => mockChain),
            })),
        }))

        // Import route
        const route = require('./route')
        GET = route.GET
        POST = route.POST
    })

    describe('GET', () => {
        it('returns 400 if userId is missing', async () => {
            const request = new Request('http://localhost/api/favorites')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Missing userId')
        })

        it('returns favorites', async () => {
            const mockData = [
                {
                    recipe_id: '1',
                    recipes: {
                        id: '1',
                        title: 'Test Recipe',
                        ratings: [{ rating: 5 }],
                    },
                },
            ]

            // select returns mockChain, eq returns mockChain.
            // But wait, the result of the chain is awaited.
            // In GET: await supabaseAdmin.from().select().eq()
            // It awaits the RESULT of eq().
            // But eq() returns mockChain.
            // mockChain is an object, not a promise.
            // So await mockChain returns mockChain.
            // But the code expects { data, error }.
            // So mockChain must have data and error properties?
            // No, supabase methods return a Promise-like builder.
            // But here I am mocking it to return `this`.
            // So `await ...eq()` resolves to `mockChain`.
            // So `const { data, error } = mockChain`.
            // So I need to add data and error to mockChain.

            mockChain.data = mockData
            mockChain.error = null

            const request = new Request('http://localhost/api/favorites?userId=123')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toHaveLength(1)
            expect(data[0].title).toBe('Test Recipe')
        })
    })

    describe('POST', () => {
        it('returns 401 if unauthorized', async () => {
            getUserFromRequest.mockResolvedValue(null)

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
            })
            const response = await POST(request)

            expect(response.status).toBe(401)
        })

        it('returns 400 if recipeId is missing', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({}),
            })
            const response = await POST(request)

            expect(response.status).toBe(400)
        })

        it('adds favorite if not exists', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })
            mockChain.single.mockResolvedValue({ data: null }) // Not existing

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: 'rec1' }),
            })
            const response = await POST(request)
            console.log(response)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.isFavorite).toBe(true)
            expect(mockChain.insert).toHaveBeenCalled()
        })

        it('removes favorite if exists', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

            // select().eq().eq().single()
            mockChain.single.mockResolvedValueOnce({
                data: { id: 'fav1' },
                error: null,
            })

            // delete().eq().eq()
            mockChain.error = null

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: 'rec1' }),
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.isFavorite).toBe(false)
            expect(mockChain.delete).toHaveBeenCalled()
        })
    })
})
