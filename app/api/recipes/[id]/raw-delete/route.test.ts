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

describe('DELETE /api/recipes/[id]/raw-delete', () => {
    const mockGetUserFromRequest = getUserFromRequest as jest.Mock
    const mockSupabase = supabaseAdmin as any

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockGetUserFromRequest.mockResolvedValue(null)
        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(401)
        expect(await response.json()).toEqual({ error: 'Unauthorized' })
    })

    it('should return 404 if recipe not found', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'user123' })
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' })
                })
            })
        })

        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ error: 'Recipe not found' })
    })

    it('should return 404 if profile not found', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'user123' })

        // Mock recipe found
        const mockRecipeQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { user_id: 'profile123' }, error: null })
                })
            })
        }

        // Mock profile not found
        const mockProfileQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: null, error: 'Not found' })
                })
            })
        }

        mockSupabase.from
            .mockReturnValueOnce(mockRecipeQuery) // First call for recipe
            .mockReturnValueOnce(mockProfileQuery) // Second call for profile

        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(404)
        expect(await response.json()).toEqual({ error: 'Profile not found' })
    })

    it('should return 403 if user is not owner', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'user123' })

        // Mock recipe found
        const mockRecipeQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { user_id: 'owner123' }, error: null })
                })
            })
        }

        // Mock profile found but different id
        const mockProfileQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { id: 'user123' }, error: null })
                })
            })
        }

        mockSupabase.from
            .mockReturnValueOnce(mockRecipeQuery)
            .mockReturnValueOnce(mockProfileQuery)

        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(403)
        expect(await response.json()).toEqual({ error: 'Forbidden' })
    })

    it('should return 500 if delete fails', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'user123' })

        // Mock recipe found
        const mockRecipeQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { user_id: 'user123' }, error: null })
                })
            })
        }

        // Mock profile found
        const mockProfileQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { id: 'user123' }, error: null })
                })
            })
        }

        // Mock delete failure
        const mockDeleteQuery = {
            delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: 'Delete failed' })
            })
        }

        mockSupabase.from
            .mockReturnValueOnce(mockRecipeQuery)
            .mockReturnValueOnce(mockProfileQuery)
            .mockReturnValueOnce(mockDeleteQuery)

        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Failed to delete recipe' })
    })

    it('should return success if delete is successful', async () => {
        mockGetUserFromRequest.mockResolvedValue({ uid: 'user123' })

        // Mock recipe found
        const mockRecipeQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { user_id: 'user123' }, error: null })
                })
            })
        }

        // Mock profile found
        const mockProfileQuery = {
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: { id: 'user123' }, error: null })
                })
            })
        }

        // Mock delete success
        const mockDeleteQuery = {
            delete: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        }

        mockSupabase.from
            .mockReturnValueOnce(mockRecipeQuery)
            .mockReturnValueOnce(mockProfileQuery)
            .mockReturnValueOnce(mockDeleteQuery)

        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(200)
        expect(await response.json()).toEqual({ success: true })
    })

    it('should return 500 on unexpected error', async () => {
        const mockGetUserFromRequest = getUserFromRequest as jest.Mock
        mockGetUserFromRequest.mockRejectedValue(new Error('Unexpected error'))
        const request = new NextRequest('http://localhost/api/recipes/123/raw-delete')
        const params = Promise.resolve({ id: '123' })

        const response = await DELETE(request, { params })

        expect(response.status).toBe(500)
        expect(await response.json()).toEqual({ error: 'Internal Server Error' })
    })
})
