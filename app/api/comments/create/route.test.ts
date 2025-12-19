/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/comments/create', () => {
    let POST: any
    let mockStorage: any
    let mockFrom: jest.Mock
    let mockInsert: jest.Mock
    let mockSelect: jest.Mock
    let mockSingle: jest.Mock
    let getUserFromRequest: jest.Mock
    let getSupabaseUserFromFirebaseUid: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        // Setup mocks
        mockSingle = jest.fn().mockResolvedValue({ data: { id: 'comment1' }, error: null })
        mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
        mockInsert = jest.fn().mockReturnValue({ select: mockSelect })

        mockFrom = jest.fn().mockReturnValue({
            insert: mockInsert,
        })

        mockStorage = {
            from: jest.fn().mockReturnValue({
                upload: jest.fn().mockResolvedValue({ data: { path: 'path/to/image' }, error: null }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://image.url' } }),
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

    it('returns 500 if server config is missing', async () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        delete process.env.NEXT_PUBLIC_SUPABASE_URL

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Server configuration error')

        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    })

    it('returns 401 if unauthorized', async () => {
        getUserFromRequest.mockResolvedValue(null)

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
        })
        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('returns 400 if fields are missing', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        // Missing content and recipe_id

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(400)
    })

    it('creates comment successfully (text only)', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        formData.append('content', 'Great recipe!')
        formData.append('recipe_id', 'rec1')

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockInsert).toHaveBeenCalledWith({
            content: 'Great recipe!',
            recipe_id: 'rec1',
            user_id: 'user1',
            image_url: null,
        })
    })

    it('creates comment successfully with image', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        formData.append('content', 'Look at this!')
        formData.append('recipe_id', 'rec1')

        const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockStorage.from).toHaveBeenCalledWith('community-photos')
        expect(mockStorage.from().upload).toHaveBeenCalled()
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            image_url: 'http://image.url',
        }))
    })

    it('returns 500 on upload error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockStorage.from().upload.mockResolvedValue({ error: { message: 'Upload Failed' } })

        const formData = new FormData()
        formData.append('content', 'Fail')
        formData.append('recipe_id', 'rec1')
        const file = new File(['fail'], 'fail.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/comments/create', {
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

        // Upload succeeds
        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        // DB fails
        mockSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

        const formData = new FormData()
        formData.append('content', 'Rollback')
        formData.append('recipe_id', 'rec1')
        const file = new File(['rollback'], 'rollback.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        // Check rollback
        expect(mockStorage.from().remove).toHaveBeenCalled()
    })

    it('logs error if rollback fails', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // Upload succeeds
        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        // DB fails
        mockSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

        // Rollback fails
        mockStorage.from().remove.mockRejectedValue(new Error('Rollback Error'))

        const consoleError = jest.spyOn(console, 'error').mockImplementation()

        const formData = new FormData()
        formData.append('content', 'Rollback Fail')
        formData.append('recipe_id', 'rec1')
        const file = new File(['rollback'], 'rollback.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        // Wait for async rollback catch
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(consoleError).toHaveBeenCalledWith('Error deleting image during rollback:', expect.any(Error))

        consoleError.mockRestore()
    })
    it('handles createClient error', async () => {
        const route = require('./route')
        jest.spyOn(console, 'error').mockImplementation()

        // Mock createClient to throw
        const { createClient } = require('@supabase/supabase-js')
        createClient.mockImplementation(() => {
            throw new Error('Client Init Error')
        })

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
        })
        const response = await route.POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Error publicando comentario')
    })

    it('handles db error without image upload', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // DB fails
        mockSingle.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

        const formData = new FormData()
        formData.append('content', 'No Image Fail')
        formData.append('recipe_id', 'rec1')

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Error publicando comentario')
        expect(mockStorage.from().remove).not.toHaveBeenCalled()
    })

    it('handles unknown error message', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // DB fails with no message
        mockSingle.mockResolvedValue({ data: null, error: { message: '' } })

        const formData = new FormData()
        formData.append('content', 'Unknown Error')
        formData.append('recipe_id', 'rec1')

        const request = new Request('http://localhost/api/comments/create', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Error desconocido')
    })
})
