import { getComments, postComment, deleteComment } from '../comments'
import { auth } from '@/lib/firebase/client'
import { supabase } from '@/lib/supabase/client'

// --- MOCKS DE INFRAESTRUCTURA ---

// Definimos los mocks de la cadena de Supabase fuera para poder inspeccionarlos
const mockEq = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockRange = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: mockSelect,
            eq: mockEq,
            order: mockOrder,
            range: mockRange
        }))
    }
}))

jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
}))

global.fetch = jest.fn()

// --- TEST SUITE ---

describe('lib/api/comments', () => {

    beforeEach(() => {
        jest.clearAllMocks()

        // Reset default Auth state (Usuario autenticado por defecto)
        Object.defineProperty(auth, 'currentUser', {
            value: { getIdToken: jest.fn().mockResolvedValue('mock-token') },
            writable: true,
            configurable: true
        })
    })

    describe('getComments', () => {
        it('fetches comments with pagination and filters is_deleted', async () => {
            const mockData = [{ id: '1', content: 'Great!' }]
            mockRange.mockResolvedValue({ data: mockData, error: null, count: 1 })

            const result = await getComments('recipe1', 1, 5)

            // Verificaciones de la cadena
            expect(supabase.from).toHaveBeenCalledWith('comments')
            expect(mockEq).toHaveBeenCalledWith('recipe_id', 'recipe1')
            expect(mockEq).toHaveBeenCalledWith('is_deleted', false) // Tu nuevo filtro
            expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
            expect(mockRange).toHaveBeenCalledWith(0, 4)

            expect(result).toEqual({ comments: mockData, total: 1 })
        })

        it('handles empty data correctly', async () => {
            mockRange.mockResolvedValue({ data: null, error: null, count: 0 })

            const result = await getComments('recipe1')
            expect(result).toEqual({ comments: [], total: 0 })
        })

        it('throws error when Supabase fails', async () => {
            mockRange.mockResolvedValue({
                data: null,
                error: { message: 'Database Connection Error' },
                count: 0
            })

            await expect(getComments('recipe1'))
                .rejects.toEqual({ message: 'Database Connection Error' })
        })
    })

    describe('postComment', () => {
        const mockFormData = new FormData()

        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', { value: null, configurable: true })

            await expect(postComment(mockFormData)).rejects.toThrow('Usuario no autenticado')
        })

        it('posts comment successfully via fetch', async () => {
            const mockComment = { id: '1', content: 'Test' }
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true, comment: mockComment })
                })

            const result = await postComment(mockFormData)

            expect(global.fetch).toHaveBeenCalledWith('/api/comments/create', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer mock-token' },
                body: mockFormData
            })
            expect(result).toEqual(mockComment)
        })

        it('handles server-side errors with message', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Inappropriate content' })
            })

            await expect(postComment(mockFormData)).rejects.toThrow('Inappropriate content')
        })
    })

    describe('deleteComment', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', { value: null, configurable: true })

            await expect(deleteComment('comment1')).rejects.toThrow('Usuario no autenticado')
        })

        it('deletes comment successfully (logical delete via API)', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true })
            })

            await deleteComment('comment1')

            expect(global.fetch).toHaveBeenCalledWith('/api/comments/comment1/delete', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer mock-token' }
            })
        })

        it('throws error if the delete API fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Not authorized to delete' })
            })

            await expect(deleteComment('comment1')).rejects.toThrow('Not authorized to delete')
        })

        it('throws default error on post failure when no error message is provided', async () => {
            const mockFormData = new FormData();
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({}) // JSON vacío, sin propiedad .error
            });

            await expect(postComment(mockFormData))
                .rejects.toThrow('Error al publicar comentario');
        });
        it('throws default error on delete failure when no error message is provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({}) // JSON vacío, sin propiedad .error
            });

            await expect(deleteComment('comment1'))
                .rejects.toThrow('Error desconocido al eliminar el comentario');
        });
    })
})