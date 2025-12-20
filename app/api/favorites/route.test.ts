/**
 * @jest-environment node
 */

// Mock env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'

describe('/api/favorites', () => {
    let GET: any
    let POST: any
    let mockChain: any
    let getUserFromRequest: jest.Mock
    let getProfileFromFirebase: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        // Setup chainable mock mejorado
        mockChain = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ error: null }),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn(),
            // Propiedades para simular el resultado final del await
            data: null,
            error: null,
        }

        // Importante: Para que const {data, error} = await chain funcione, 
        // el último método de la cadena debe devolver un objeto con esas propiedades
        // o el mockChain mismo debe ser un Promise-like (thenable).
        mockChain.then = (resolve: any) => resolve({ data: mockChain.data, error: mockChain.error });

        getUserFromRequest = jest.fn()
        getProfileFromFirebase = jest.fn()

        jest.doMock('@/lib/auth/requireAuth', () => ({
            getUserFromRequest,
            getProfileFromFirebase,
        }))

        jest.doMock('@supabase/supabase-js', () => ({
            createClient: jest.fn(() => ({
                from: jest.fn(() => mockChain),
            })),
        }))

        const route = require('./route')
        GET = route.GET
        POST = route.POST
    })

    describe('GET', () => {
        it('returns favorites and verifies new filters', async () => {
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

            mockChain.data = mockData
            mockChain.error = null

            const request = new Request('http://localhost/api/favorites?userId=123')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)

            // Verificamos que se llamó al select con !inner
            expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('recipes!inner'))

            // Verificamos el nuevo filtro de is_deleted
            expect(mockChain.eq).toHaveBeenCalledWith("recipes.is_deleted", false)

            // Verificamos el nuevo ordenamiento
            expect(mockChain.order).toHaveBeenCalledWith("created_at", { ascending: false })

            expect(data[0].average_rating).toEqual({ rating: 5, count: 1 })
        })

        it('returns 500 on database error', async () => {
            mockChain.data = null
            mockChain.error = { message: 'DB Error' }

            const request = new Request('http://localhost/api/favorites?userId=123')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('DB Error')
        })
    })

    describe('POST', () => {
        it('removes favorite if exists', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getProfileFromFirebase.mockResolvedValue({ id: 'user1' })

            // Mock de búsqueda inicial (.single())
            mockChain.single.mockResolvedValueOnce({
                data: { id: 'fav1' },
                error: null,
            })

            // Mock del resultado de .delete().eq().eq()
            // Como delete() devuelve mockChain, y eq() también, 
            // el await final usará mockChain.then
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

        it('returns 500 on insert error', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getProfileFromFirebase.mockResolvedValue({ id: 'user1' })
            mockChain.single.mockResolvedValue({ data: null }) // No existe, va a insertar

            // Simulamos error en insert
            mockChain.insert.mockResolvedValue({ error: { message: 'Insert Error' } })

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: 'rec1' }),
            })
            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Insert Error')
        })
        it('returns 400 if userId is not provided in searchParams', async () => {
            // Request sin query string (?userId=...)
            const request = new Request('http://localhost/api/favorites')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Missing userId')
        })
        it('returns 401 if getUserFromRequest fails (no token)', async () => {
            getUserFromRequest.mockResolvedValue(null) // Simula usuario no autenticado

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: 'rec1' })
            })
            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(401)
            expect(data.error).toBe('Unauthorized')
        })

        it('returns 400 if recipeId is missing in the body', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getProfileFromFirebase.mockResolvedValue({ id: 'user1' })

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({}) // Cuerpo vacío sin recipeId
            })
            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Missing recipeId')
        })

        it('returns isFavorite true when successfully adding a new favorite', async () => {
            getUserFromRequest.mockResolvedValue({ uid: '123' })
            getProfileFromFirebase.mockResolvedValue({ id: 'user1' })

            // Mock: no existe el favorito previo
            mockChain.single.mockResolvedValue({ data: null, error: null })

            // Mock: la inserción es exitosa
            mockChain.insert.mockResolvedValue({ error: null })

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: 'rec-new' })
            })
            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.isFavorite).toBe(true)
            expect(mockChain.insert).toHaveBeenCalledWith([{
                user_id: 'user1',
                recipe_id: 'rec-new'
            }])
        })
    })
})