import { getCategories, getRecipes, getRecipe, getRecipeCommunityPhotos, createRecipe, updateRecipe, deleteRecipe, deleteRecipePermanently } from '../recipes'
import { supabase } from '@/lib/supabase/client'
import { auth } from '@/lib/firebase/client'
import { getAverageRating } from '../../utils'

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            single: jest.fn()
        }))
    }
}))

jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
}))

jest.mock('../../utils', () => ({
    getAverageRating: jest.fn()
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

describe('lib/api/recipes', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset auth mock
        Object.defineProperty(auth, 'currentUser', {
            value: { getIdToken: jest.fn().mockResolvedValue('mock-token') },
            writable: true
        })
    })

    describe('getCategories', () => {
        it('fetches categories successfully', async () => {
            const mockData = [{ id: '1', name: 'Cat 1' }]
            const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getCategories()

            expect(supabase.from).toHaveBeenCalledWith('recipe_categories')
            expect(result).toEqual(mockData)
        })

        it('returns empty array on error', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getCategories()

            expect(console.error).toHaveBeenCalledWith('Error fetching categories:', { message: 'DB Error' })
            expect(result).toEqual([])
        })

        it('returns empty array when data is null', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getCategories()

            expect(result).toEqual([])
        })
    })

    describe('getRecipes', () => {
        it('fetches recipes with default params', async () => {
            const mockData = [{ id: '1', title: 'Recipe 1', ratings: [] }]
            const mockRange = jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockData, error: null, count: 1 })
            })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    range: mockRange
                })

                ; (getAverageRating as jest.Mock).mockReturnValue(0)

            const result = await getRecipes()

            expect(supabase.from).toHaveBeenCalledWith('recipes')
            expect(mockRange).toHaveBeenCalledWith(0, 5) // default page 1, limit 6 -> 0 to 5
            expect(result.recipes).toHaveLength(1)
            expect(result.total).toBe(1)
        })

        it('applies filters correctly', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                lt: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChain)

            await getRecipes(1, 6, {
                category: 'cat1',
                difficulty: 'easy',
                search: 'pizza',
                time: 'fast',
                tags: ['tag1'],
                user_id: 'user1'
            })

            expect(mockChain.eq).toHaveBeenCalledWith('category_id', 'cat1')
            expect(mockChain.eq).toHaveBeenCalledWith('difficulty', 'easy')
            expect(mockChain.or).toHaveBeenCalledWith(expect.stringContaining('pizza'))
            expect(mockChain.lt).toHaveBeenCalledWith('cook_time_minutes', 20)
            expect(mockChain.in).toHaveBeenCalledWith('recipe_tags.tag_id', ['tag1'])
            expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user1')
        })

        it('handles medium time filter', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                gte: jest.fn().mockReturnThis(),
                lte: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChain)

            await getRecipes(1, 6, { time: 'medium' })

            expect(mockChain.gte).toHaveBeenCalledWith('cook_time_minutes', 20)
            expect(mockChain.lte).toHaveBeenCalledWith('cook_time_minutes', 60)
        })

        it('handles slow time filter', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                gt: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChain)

            await getRecipes(1, 6, { time: 'slow' })

            expect(mockChain.gt).toHaveBeenCalledWith('cook_time_minutes', 60)
        })

        it('ignores invalid time filter', async () => {
            const mockChainInvalid = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChainInvalid)

            await getRecipes(1, 6, { time: 'invalid' })

            // Should not call any time filters
            expect(mockChainInvalid.select).toHaveBeenCalled()
        })

        it('returns empty result on error', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' }, count: 0 })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChain)

            const result = await getRecipes()

            expect(console.error).toHaveBeenCalledWith('Error fetching recipes:', { message: 'DB Error' })
            expect(result).toEqual({ recipes: [], total: 0 })
        })

        it('returns empty array when data is null', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                range: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: null, error: null, count: null })
            }
                ; (supabase.from as jest.Mock).mockReturnValue(mockChain)

            const result = await getRecipes()

            expect(result).toEqual({ recipes: [], total: 0 })
        })
    })

    describe('getRecipe', () => {
        it('fetches recipe successfully', async () => {
            const mockRecipe = {
                id: '1',
                title: 'Recipe 1',
                ratings: [],
                recipe_steps: [{ step_order: 2 }, { step_order: 1 }]
            }
            const mockSingle = jest.fn().mockResolvedValue({ data: mockRecipe, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

                ; (getAverageRating as jest.Mock).mockReturnValue(5)

            const result = await getRecipe('1')

            expect(supabase.from).toHaveBeenCalledWith('recipes')
            expect(result).toEqual(mockRecipe)
            expect(result?.recipe_steps?.[0].step_order).toBe(1) // Sorted
            expect(result?.average_rating).toBe(5)
        })

        it('handles recipe without steps', async () => {
            const mockRecipe = {
                id: '1',
                title: 'Recipe 1',
                ratings: [],
                recipe_steps: null
            }
            const mockSingle = jest.fn().mockResolvedValue({ data: mockRecipe, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const result = await getRecipe('1')

            expect(result).toEqual(mockRecipe)
        })

        it('returns null on error', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const result = await getRecipe('1')

            expect(console.error).toHaveBeenCalledWith('Error fetching recipe:', { message: 'DB Error' })
            expect(result).toBeNull()
        })

        it('returns null when data is null and no error', async () => {
            const mockSingle = jest.fn().mockResolvedValue({
                data: null,
                error: null
            })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const result = await getRecipe('1')

            expect(result).toBeNull()
        })
    })

    describe('getRecipeCommunityPhotos', () => {
        it('fetches photos successfully', async () => {
            const mockData = [{ image_url: 'url1' }]
            const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    not: jest.fn().mockReturnThis(),
                    neq: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getRecipeCommunityPhotos('1')

            expect(supabase.from).toHaveBeenCalledWith('comments')
            expect(result).toEqual(mockData)
        })

        it('returns null on error', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    not: jest.fn().mockReturnThis(),
                    neq: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getRecipeCommunityPhotos('1')

            expect(console.error).toHaveBeenCalledWith('Error fetching community photos:', { message: 'DB Error' })
            expect(result).toBeNull()
        })
    })

    describe('createRecipe', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            const formData = new FormData()
            await expect(createRecipe(formData)).rejects.toThrow('Usuario no autenticado')
        })

        it('creates recipe successfully', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })

            const result = await createRecipe(formData)

            expect(global.fetch).toHaveBeenCalledWith('/api/create-recipe-with-image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer mock-token'
                },
                body: formData
            })
            expect(result).toEqual({ success: true })
        })

        it('throws error on failure', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'Creation failed' })
                })

            await expect(createRecipe(formData)).rejects.toThrow('Creation failed')
        })

        it('throws default error on failure without message', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

            await expect(createRecipe(formData)).rejects.toThrow('Error desconocido al crear la receta')
        })
    })

    describe('updateRecipe', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            const formData = new FormData()
            await expect(updateRecipe('1', formData)).rejects.toThrow('Usuario no autenticado')
        })

        it('updates recipe successfully', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })

            const result = await updateRecipe('1', formData)

            expect(global.fetch).toHaveBeenCalledWith('/api/update-recipe-with-image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer mock-token'
                },
                body: formData
            })
            // Should append recipe_id
            expect(formData.get('recipe_id')).toBe('1')
            expect(result).toEqual({ success: true })
        })

        it('throws error on failure', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'Update failed' })
                })

            await expect(updateRecipe('1', formData)).rejects.toThrow('Update failed')
        })

        it('throws default error on failure without message', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

            await expect(updateRecipe('1', formData)).rejects.toThrow('Error desconocido al actualizar la receta')
        })
        describe('deleteRecipe', () => {
            it('throws error if user is not authenticated', async () => {
                Object.defineProperty(auth, 'currentUser', {
                    value: null,
                    writable: true
                })

                await expect(deleteRecipe('1')).rejects.toThrow('Usuario no autenticado')
            })

            it('deletes recipe successfully', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })

                const result = await deleteRecipe('1')

                expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer mock-token'
                    }
                })
                expect(result).toEqual({ success: true })
            })

            it('throws error on failure', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'Delete failed' })
                })

                await expect(deleteRecipe('1')).rejects.toThrow('Delete failed')
            })

            it('throws default error on failure without message', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

                await expect(deleteRecipe('1')).rejects.toThrow('Error desconocido al eliminar la receta')
            })
        })

        describe('deleteRecipePermanently', () => {
            it('throws error if user is not authenticated', async () => {
                Object.defineProperty(auth, 'currentUser', {
                    value: null,
                    writable: true
                })

                await expect(deleteRecipePermanently('1')).rejects.toThrow('Usuario no autenticado')
            })

            it('deletes recipe permanently successfully', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })

                const result = await deleteRecipePermanently('1')

                expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1/permanent-delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer mock-token'
                    }
                })
                expect(result).toEqual({ success: true })
            })

            it('throws error on failure', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'Delete failed' })
                })

                await expect(deleteRecipePermanently('1')).rejects.toThrow('Delete failed')
            })

            it('throws default error on failure without message', async () => {
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

                await expect(deleteRecipePermanently('1')).rejects.toThrow('Error desconocido al eliminar la receta permanentemente')
            })
        })
    })
})
