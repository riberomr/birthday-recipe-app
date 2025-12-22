import { getComments, postComment, deleteComment } from '../comments'
import { auth } from '@/lib/firebase/client'

// Mock Firebase Auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
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

describe('lib/api/comments', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset auth mock
        Object.defineProperty(auth, 'currentUser', {
            value: { getIdToken: jest.fn().mockResolvedValue('mock-token') },
            writable: true
        })
    })

    describe('getComments', () => {
        it('fetches comments successfully', async () => {
            const mockData = { comments: [{ id: '1', content: 'Great!' }], total: 1 }
                ; (global.fetch as jest.Mock).mockResolvedValue({
                    ok: true,
                    json: async () => ({ data: mockData })
                })

            const result = await getComments('recipe1', 1, 5)

            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/comments?recipeId=recipe1&page=1&limit=5'))
            expect(result).toEqual(mockData)
        })

        it('returns empty result on error', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: false
            })

            const result = await getComments('recipe1')

            expect(console.error).toHaveBeenCalledWith('Error fetching comments')
            expect(result).toEqual({ comments: [], total: 0 })
        })

        it('returns empty comments and 0 total on invalid JSON', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            const result = await getComments('recipe1')

            expect(console.error).toHaveBeenCalledWith('Error fetching or parsing comments:', expect.any(Error))
            expect(result).toEqual({ comments: [], total: 0 })
        })

        it('returns empty comments and 0 total if data properties are null', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ data: { comments: null, total: null } })
            })

            const result = await getComments('recipe1')
            expect(result).toEqual({ comments: [], total: 0 })
        })
    })

    describe('postComment', () => {
        const mockFormData = new FormData()

        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(postComment(mockFormData)).rejects.toThrow('Usuario no autenticado')
        })

        it('posts comment successfully', async () => {
            const mockComment = { id: '1', content: 'Test' }
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, comment: mockComment })
                })

            const result = await postComment(mockFormData)

            expect(global.fetch).toHaveBeenCalledWith('/api/comments/create', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                }),
                body: mockFormData
            }))
            expect(result).toEqual(mockComment)
        })

        it('throws error on failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Inappropriate content' })
            })

            await expect(postComment(mockFormData)).rejects.toThrow('Inappropriate content')
        })

        it('throws error on invalid JSON response', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            await expect(postComment(mockFormData)).rejects.toThrow('Error al procesar la respuesta del servidor')
        })

        it('throws default error if no error message from server', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            })

            await expect(postComment(mockFormData)).rejects.toThrow('Error al publicar comentario')
        })

        it('throws default error message on non-Error rejection', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue('Some string error')

            await expect(postComment(mockFormData)).rejects.toThrow('Error al publicar comentario')
        })
    })

    describe('deleteComment', () => {
        it('throws error if user is not authenticated', async () => {
            // @ts-ignore
            auth.currentUser = null
            await expect(deleteComment('comment1')).rejects.toThrow('Usuario no autenticado')
        })

        it('throws generic error on unknown error', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

            await expect(deleteComment('comment1')).rejects.toThrow('Network error')
        })

        it('throws default error message on non-Error rejection', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue('Some string error')

            await expect(deleteComment('comment1')).rejects.toThrow('Error desconocido al eliminar el comentario')
        })

        it('throws default error message on unknown error without message', async () => {
            ; (global.fetch as jest.Mock).mockRejectedValue(new Error())

            await expect(deleteComment('comment1')).rejects.toThrow('Error desconocido al eliminar el comentario')
        })

        it('deletes comment successfully', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await deleteComment('comment1')

            expect(global.fetch).toHaveBeenCalledWith('/api/comments/comment1/delete', expect.objectContaining({
                method: 'DELETE',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-token'
                })
            }))
        })

        it('throws error on failure', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Not authorized to delete' })
            })

            await expect(deleteComment('comment1')).rejects.toThrow('Not authorized to delete')
        })

        it('throws error on invalid JSON response', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            await expect(deleteComment('comment1')).rejects.toThrow('Error al procesar la respuesta del servidor')
        })

        it('throws default error if no error message from server', async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({})
            })

            await expect(deleteComment('comment1')).rejects.toThrow('Error desconocido al eliminar el comentario')
        })
    })
})