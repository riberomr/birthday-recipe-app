import { getCategories, getRecipes, getRecipe, getRecipeCommunityPhotos, createRecipe, updateRecipe, deleteRecipe, deleteRecipePermanently } from '../recipes'
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

// Mock console.error to avoid noise in tests
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
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockData })
                })

            const result = await getCategories()

            expect(global.fetch).toHaveBeenCalledWith('/api/recipes/categories')
            expect(result).toEqual(mockData)
        })

        it('returns empty array on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getCategories()

            expect(console.error).toHaveBeenCalledWith('Error fetching categories')
            expect(result).toEqual([])
        })

        it('returns empty array if data is null', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: null })
            })

            const result = await getCategories()

            expect(result).toEqual([])
        })
    })

    describe('getRecipes', () => {
        it('fetches recipes with default params', async () => {
            const mockData = { recipes: [{ id: '1', title: 'Recipe 1' }], total: 1 }
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockData })
                })

            const result = await getRecipes()

            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/recipes?page=1&limit=6'))
            expect(result.recipes).toHaveLength(1)
            expect(result.total).toBe(1)
        })

        it('applies filters correctly', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { recipes: [], total: 0 } })
            })

            await getRecipes(1, 6, {
                category: 'cat1',
                difficulty: 'easy',
                search: 'pizza',
                time: 'fast',
                tags: ['tag1'],
                user_id: 'user1'
            })

            const url = (global.fetch as jest.Mock).mock.calls[0][0]
            expect(url).toContain('category=cat1')
            expect(url).toContain('difficulty=easy')
            expect(url).toContain('search=pizza')
            expect(url).toContain('time=fast')
            expect(url).toContain('tags=tag1')
            expect(url).toContain('user_id=user1')
        })

        it('returns empty result on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getRecipes()

            expect(console.error).toHaveBeenCalledWith('Error fetching recipes')
            expect(result).toEqual({ recipes: [], total: 0 })
        })

        it('returns empty result if data properties are null', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { recipes: null, total: null } })
            })

            const result = await getRecipes()

            expect(result).toEqual({ recipes: [], total: 0 })
        })
    })

    describe('getRecipe', () => {
        it('fetches recipe successfully', async () => {
            const mockRecipe = { id: '1', title: 'Recipe 1' }
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockRecipe })
                })

            const result = await getRecipe('1')

            expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1')
            expect(result).toEqual(mockRecipe)
        })

        it('returns null on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getRecipe('1')

            expect(console.error).toHaveBeenCalledWith('Error fetching recipe')
            expect(result).toBeNull()
        })
    })

    describe('getRecipeCommunityPhotos', () => {
        it('fetches photos successfully', async () => {
            const mockData = [{ image_url: 'url1' }]
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockData })
                })

            const result = await getRecipeCommunityPhotos('1')

            expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1/photos')
            expect(result).toEqual(mockData)
        })

        it('returns null on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getRecipeCommunityPhotos('1')

            expect(console.error).toHaveBeenCalledWith('Error fetching community photos')
            expect(result).toBeNull()
        })
    })

    describe('createRecipe', () => {
        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
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

            expect(global.fetch).toHaveBeenCalledWith('/api/create-recipe-with-image', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                }),
                body: formData
            }))
            expect(result).toEqual({ success: true })
        })

        it('throws error on API failure', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'API Error' })
                })

            await expect(createRecipe(formData)).rejects.toThrow('API Error')
        })

        it('throws default error on API failure without message', async () => {
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
            // @ts-ignore
            auth.currentUser = null
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

            expect(global.fetch).toHaveBeenCalledWith('/api/update-recipe-with-image', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                }),
                body: formData
            }))
            expect(formData.get('recipe_id')).toBe('1')
            expect(result).toEqual({ success: true })
        })

        it('throws error on API failure', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'API Error' })
                })

            await expect(updateRecipe('1', formData)).rejects.toThrow('API Error')
        })

        it('throws default error on API failure without message', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

            await expect(updateRecipe('1', formData)).rejects.toThrow('Error desconocido al actualizar la receta')
        })
    })

    describe('deleteRecipe', () => {
        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(deleteRecipe('1')).rejects.toThrow('Usuario no autenticado')
        })

        it('deletes recipe successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            const result = await deleteRecipe('1')

            expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1/delete', expect.objectContaining({
                method: 'DELETE',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                })
            }))
            expect(result).toEqual({ success: true })
        })

        it('throws error on API failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'API Error' })
            })

            await expect(deleteRecipe('1')).rejects.toThrow('API Error')
        })

        it('throws default error on API failure without message', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            })

            await expect(deleteRecipe('1')).rejects.toThrow('Error desconocido al eliminar la receta')
        })
    })

    describe('deleteRecipePermanently', () => {
        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(deleteRecipePermanently('1')).rejects.toThrow('Usuario no autenticado')
        })

        it('deletes recipe permanently successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            const result = await deleteRecipePermanently('1')

            expect(global.fetch).toHaveBeenCalledWith('/api/recipes/1/permanent-delete', expect.objectContaining({
                method: 'DELETE',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                })
            }))
            expect(result).toEqual({ success: true })
        })

        it('throws error on API failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'API Error' })
            })

            await expect(deleteRecipePermanently('1')).rejects.toThrow('API Error')
        })

        it('throws default error on API failure without message', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            })

            await expect(deleteRecipePermanently('1')).rejects.toThrow('Error desconocido al eliminar la receta permanentemente')
        })
    })
})
