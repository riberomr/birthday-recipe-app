import { DELETE } from './route'
import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth/requireAuth'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Mock dependencies
jest.mock('@/lib/auth/requireAuth')
jest.mock('@/lib/firebase/admin', () => ({
    auth: {
        verifyIdToken: jest.fn()
    }
}))
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(),
    }
}))
jest.mock('next/server', () => ({
    NextRequest: class {
        url: string
        constructor(url: string) {
            this.url = url
        }
    },
    NextResponse: {
        json: (body: any, init?: any) => ({
            json: async () => body,
            status: init?.status || 200,
        })
    }
}))

describe('DELETE /api/comments/[id]/delete', () => {
    const mockGetUserFromRequest = getUserFromRequest as jest.Mock
    const mockSupabase = supabaseAdmin as any

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockGetUserFromRequest.mockResolvedValue(null)
        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(401)
        expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('should return 404 if comment not found', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-1' })

        // Mock comment query (Not found)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' })
                    })
                })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ error: 'Comment not found' })
    })

    it('should allow comment author to delete', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-1' })

        // 1. Mock comment query (Found)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_id: 'user-id-1', recipe_id: 'recipe-id-1' },
                            error: null
                        })
                    })
                })
            })
        })

        // 2. Mock profile query (Found, matches comment author)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'user-id-1' },
                        error: null
                    })
                })
            })
        })

        // 3. Mock update (Success)
        mockSupabase.from.mockReturnValueOnce({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ success: true })
    })

    it('should allow recipe owner to delete', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-2' })

        // 1. Mock comment query (Found, belongs to user-id-1)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_id: 'user-id-1', recipe_id: 'recipe-id-1' },
                            error: null
                        })
                    })
                })
            })
        })

        // 2. Mock profile query (Found, is user-id-2)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'user-id-2' },
                        error: null
                    })
                })
            })
        })

        // 3. Mock recipe query (Found, owned by user-id-2)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-id-2' },
                        error: null
                    })
                })
            })
        })

        // 4. Mock update (Success)
        mockSupabase.from.mockReturnValueOnce({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ success: true })
    })

    it('should forbid unauthorized user', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-3' })

        // 1. Mock comment query (Found, belongs to user-id-1)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_id: 'user-id-1', recipe_id: 'recipe-id-1' },
                            error: null
                        })
                    })
                })
            })
        })

        // 2. Mock profile query (Found, is user-id-3)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'user-id-3' },
                        error: null
                    })
                })
            })
        })

        // 3. Mock recipe query (Found, owned by user-id-2)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-id-2' },
                        error: null
                    })
                })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(403)
        expect(await response.json()).toEqual({ error: 'Forbidden' })
    })

    it('should return 500 if update fails', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-1' })

        // 1. Mock comment query
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_id: 'user-id-1', recipe_id: 'recipe-id-1' },
                            error: null
                        })
                    })
                })
            })
        })

        // 2. Mock profile query
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'user-id-1' },
                        error: null
                    })
                })
            })
        })

        // 3. Mock update (Failure)
        mockSupabase.from.mockReturnValueOnce({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: 'Database error' })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Failed to delete comment' })
    })

    it('should return 404 if profile not found', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'firebase-uid-1' })

        // 1. Mock comment query (Found)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { user_id: 'user-id-1', recipe_id: 'recipe-id-1' },
                            error: null
                        })
                    })
                })
            })
        })

        // 2. Mock profile query (NOT FOUND)
        mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: 'Profile not found' })
                })
            })
        })

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ error: 'Profile not found' })
    })

    it('should return 500 on unexpected internal error (catch block)', async () => {
        // Forzamos un error arrojando una excepción en el primer paso
        mockGetUserFromRequest.mockRejectedValue(new Error('Unexpected Crash'))

        const request = new NextRequest('http://localhost/api/comments/123/delete')
        const params = Promise.resolve({ id: '123' })

        // Espiamos el console.error para que no ensucie la terminal del test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Internal Server Error' })

        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
})
