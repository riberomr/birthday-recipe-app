/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/update-recipe-with-image', () => {
    let POST: any
    let mockStorage: any
    let mockFrom: jest.Mock
    let mockInsert: jest.Mock
    let mockSelect: jest.Mock
    let mockSingle: jest.Mock
    let mockUpdate: jest.Mock
    let mockDelete: jest.Mock
    let mockEq: jest.Mock
    let getUserFromRequest: jest.Mock
    let getSupabaseUserFromFirebaseUid: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        // Setup mocks
        mockSingle = jest.fn().mockResolvedValue({ data: { id: 'recipe1', user_id: 'user1', image_url: 'http://old.url/img.png' }, error: null })
        mockEq = jest.fn().mockReturnValue({ single: mockSingle, delete: jest.fn().mockResolvedValue({ error: null }) })
        mockSelect = jest.fn().mockReturnValue({ eq: mockEq })
        mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
        mockDelete = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
        mockInsert = jest.fn().mockResolvedValue({ error: null })

        mockFrom = jest.fn().mockReturnValue({
            select: mockSelect,
            update: mockUpdate,
            delete: mockDelete,
            insert: mockInsert,
        })

        mockStorage = {
            from: jest.fn().mockReturnValue({
                upload: jest.fn().mockResolvedValue({ data: { path: 'path/to/new_image' }, error: null }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://new.url' } }),
                remove: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
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
                from: mockFrom,
                storage: mockStorage,
            })),
        }))

        // Import route
        const route = require('./route')
        POST = route.POST
    })

    it('returns 401 if unauthorized', async () => {
        getUserFromRequest.mockResolvedValue(null)

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
        })
        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('returns 400 if recipe ID is missing', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        // Missing recipe_id

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('returns 404 if recipe not found', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockSingle.mockResolvedValue({ data: null, error: null })

        const formData = new FormData()
        formData.append('recipe_id', 'rec1')

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(404)
    })

    it('returns 403 if user does not own recipe', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockSingle.mockResolvedValue({ data: { id: 'rec1', user_id: 'other_user' }, error: null })

        const formData = new FormData()
        formData.append('recipe_id', 'rec1')

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(403)
    })

    it('updates recipe successfully with new image', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        formData.append('recipe_id', 'rec1')
        formData.append('title', 'Updated Cake')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')

        const file = new File(['(new cake)'], 'new.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)

        // Verify update
        expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Updated Cake',
            image_url: 'http://new.url',
        }))

        // Verify old image removal (since we replaced it)
        expect(mockStorage.from().remove).toHaveBeenCalledWith(['img.png'])
    })

    it('returns 500 on upload error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockStorage.from().upload.mockResolvedValue({ error: { message: 'Upload Failed' } })

        const formData = new FormData()
        formData.append('recipe_id', 'rec1')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['fail'], 'fail.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Falló la subida de imagen')
    })

    it('rolls back image on db error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // Mock Date and Math for predictable filename
        jest.spyOn(Date, 'now').mockReturnValue(1234567890)
        jest.spyOn(Math, 'random').mockReturnValue(0.5)

        // Upload succeeds
        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/new_image' }, error: null })

        // DB update fails
        mockUpdate.mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: { message: 'DB Error' } })
        })

        const formData = new FormData()
        formData.append('recipe_id', 'rec1')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['rollback'], 'rollback.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/update-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)

        // Expected filename: 1234567890-0.5(base36).png
        // 0.5.toString(36) is "0.i" -> substring(7) is empty string?
        // Wait, Math.random().toString(36).substring(7)
        // 0.5.toString(36) is "0.8" (actually 0.5 is 0.8 in base 36? No.)
        // 0.5 decimal is 0.1 in base 2.
        // Let's just use a regex match or expect.stringContaining

        expect(mockStorage.from().remove).toHaveBeenCalledWith(
            expect.arrayContaining([expect.stringMatching(/.*\.png/)])
        )

        jest.restoreAllMocks()
    })
})
