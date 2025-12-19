/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server'

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/create-recipe-with-image', () => {
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
        mockSingle = jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null })
        mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
        mockInsert = jest.fn().mockReturnValue({ select: mockSelect, error: null }) // Default success for insert

        // For related tables, insert might not call select/single
        // So we need to handle that.
        // The code awaits insert() result directly for related tables.
        // So insert() should return a promise resolving to { error: null }
        // BUT for the main recipe, it calls .select().single().
        // So we need a mock that handles both.

        const mockBuilder: any = Promise.resolve({ error: null })
        mockBuilder.select = jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null })
        })

        mockInsert = jest.fn().mockReturnValue(mockBuilder)

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

    it('returns 401 if unauthorized', async () => {
        getUserFromRequest.mockResolvedValue(null)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
        })
        const response = await POST(request)

        expect(response.status).toBe(401)
    })

    it('creates recipe successfully with all data', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        formData.append('title', 'Yummy Cake')
        formData.append('description', 'Delicious')
        formData.append('prep_time', '10')
        formData.append('cook_time', '20')
        formData.append('difficulty', 'Easy')
        formData.append('servings', '4')
        formData.append('ingredients', JSON.stringify([{ name: 'Flour', amount: '1 cup', optional: false }]))
        formData.append('steps', JSON.stringify([{ content: 'Mix' }]))
        formData.append('nutrition', JSON.stringify([{ name: 'Calories', amount: '100' }]))
        formData.append('tags', JSON.stringify(['tag1']))

        const file = new File(['(cake)'], 'cake.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.recipeId).toBe('recipe1')

        // Verify inserts
        // 1. Recipe
        expect(mockFrom).toHaveBeenCalledWith('recipes')
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Yummy Cake',
            image_url: 'http://image.url',
        }))

        // 2. Ingredients
        expect(mockFrom).toHaveBeenCalledWith('recipe_ingredients')

        // 3. Steps
        expect(mockFrom).toHaveBeenCalledWith('recipe_steps')

        // 4. Nutrition
        expect(mockFrom).toHaveBeenCalledWith('recipe_nutrition')

        // 5. Tags
        expect(mockFrom).toHaveBeenCalledWith('recipe_tags')
    })

    it('returns 500 on upload error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockStorage.from().upload.mockResolvedValue({ error: { message: 'Upload Failed' } })

        const formData = new FormData()
        formData.append('title', 'Fail')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['fail'], 'fail.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
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

        // DB fails on recipe insert
        const mockBuilder: any = Promise.resolve({ error: { message: 'DB Error' } })
        mockBuilder.select = jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
        })
        // We need to make sure the FIRST insert (recipe) fails.
        // Or we can make it fail on the promise resolution if it doesn't call select/single?
        // The code calls .insert().select().single().
        // So if single() returns error, it throws.
        // But wait, the code checks `recipeError` from `await ...single()`.

        // Let's override mockInsert for this test
        mockInsert.mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
            })
        })

        const formData = new FormData()
        formData.append('title', 'Rollback')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['rollback'], 'rollback.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
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

        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        // Mock recipe insert failure
        mockInsert.mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
            })
        })

        mockStorage.from().remove.mockRejectedValue(new Error('Rollback Error'))
        const consoleError = jest.spyOn(console, 'error').mockImplementation()

        const formData = new FormData()
        formData.append('title', 'Rollback Fail')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['rollback'], 'rollback.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        await new Promise(resolve => setTimeout(resolve, 0))
        expect(consoleError).toHaveBeenCalledWith('Error deleting image during rollback:', expect.any(Error))
        consoleError.mockRestore()
    })

    it('returns 500 if server config is missing', async () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        delete process.env.NEXT_PUBLIC_SUPABASE_URL

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Server configuration error')

        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    })

    it('creates recipe successfully without file (using existing url)', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        const formData = new FormData()
        formData.append('title', 'No File Recipe')
        formData.append('image_url', 'http://existing.url')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
            title: 'No File Recipe',
            image_url: 'http://existing.url',
        }))
        expect(mockStorage.from().upload).not.toHaveBeenCalled()
    })

    it('rolls back if related data insert fails', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        // Recipe insert succeeds
        const mockBuilder: any = Promise.resolve({ error: null })
        mockBuilder.select = jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null })
        })

        mockFrom.mockImplementation((table) => {
            if (table === 'recipes') {
                return { insert: jest.fn().mockReturnValue(mockBuilder) }
            }
            if (table === 'recipe_ingredients') {
                return { insert: jest.fn().mockResolvedValue({ error: { message: 'Ingredient Error' } }) }
            }
            return { insert: jest.fn().mockResolvedValue({ error: null }) }
        })

        const formData = new FormData()
        formData.append('title', 'Related Fail')
        formData.append('ingredients', JSON.stringify([{ name: 'Flour' }]))
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['img'], 'img.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockStorage.from().remove).toHaveBeenCalled()
    })

    it('handles step insert error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        mockFrom.mockImplementation((table) => {
            if (table === 'recipes') return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null }) }) }) }
            if (table === 'recipe_ingredients') return { insert: jest.fn().mockResolvedValue({ error: null }) }
            if (table === 'recipe_steps') return { insert: jest.fn().mockResolvedValue({ error: { message: 'Step Error' } }) }
            return { insert: jest.fn().mockResolvedValue({ error: null }) }
        })

        const formData = new FormData()
        formData.append('title', 'Step Fail')
        formData.append('ingredients', JSON.stringify([{ name: 'Flour' }]))
        formData.append('steps', JSON.stringify([{ content: 'Mix' }]))
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        const file = new File(['img'], 'img.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockStorage.from().remove).toHaveBeenCalled()
    })

    it('handles nutrition insert error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })
        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        mockFrom.mockImplementation((table) => {
            if (table === 'recipes') return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null }) }) }) }
            if (table === 'recipe_nutrition') return { insert: jest.fn().mockResolvedValue({ error: { message: 'Nutrition Error' } }) }
            return { insert: jest.fn().mockResolvedValue({ error: null }) }
        })

        const formData = new FormData()
        formData.append('title', 'Nut Fail')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', JSON.stringify([{ name: 'Cal', amount: '100' }]))
        formData.append('tags', '[]')
        const file = new File(['img'], 'img.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockStorage.from().remove).toHaveBeenCalled()
    })

    it('handles tags insert error', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })
        mockStorage.from().upload.mockResolvedValue({ data: { path: 'path/to/image' }, error: null })

        mockFrom.mockImplementation((table) => {
            if (table === 'recipes') return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'recipe1' }, error: null }) }) }) }
            if (table === 'recipe_tags') return { insert: jest.fn().mockResolvedValue({ error: { message: 'Tag Error' } }) }
            return { insert: jest.fn().mockResolvedValue({ error: null }) }
        })

        const formData = new FormData()
        formData.append('title', 'Tag Fail')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', JSON.stringify(['tag1']))
        const file = new File(['img'], 'img.png', { type: 'image/png' })
        formData.append('file', file)

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockStorage.from().remove).toHaveBeenCalled()
    })

    it('does not attempt rollback if no image uploaded', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // Mock DB failure
        mockInsert.mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
            })
        })

        const formData = new FormData()
        formData.append('title', 'No Image Fail')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')
        // No file

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)

        expect(response.status).toBe(500)
        expect(mockStorage.from().remove).not.toHaveBeenCalled()
    })

    it('handles unknown error without message', async () => {
        getUserFromRequest.mockResolvedValue({ uid: '123' })
        getSupabaseUserFromFirebaseUid.mockResolvedValue({ id: 'user1' })

        // Mock DB failure with object having no message
        mockInsert.mockReturnValue({
            select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: null, error: {} })
            })
        })

        const formData = new FormData()
        formData.append('title', 'Unknown Error')
        formData.append('ingredients', '[]')
        formData.append('steps', '[]')
        formData.append('nutrition', '[]')
        formData.append('tags', '[]')

        const request = new Request('http://localhost/api/create-recipe-with-image', {
            method: 'POST',
            body: formData,
        })
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Error desconocido')
    })
})
