import { getComments, postComment } from './comments'
import { auth } from '@/lib/firebase/client'
import { supabase } from '@/lib/supabase/client'

// Mock Firebase Auth
jest.mock('@/lib/firebase/client', () => ({
    auth: {
        currentUser: null
    }
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn()
        }))
    }
}))

// Mock global fetch
global.fetch = jest.fn()

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
        it('fetches comments with pagination', async () => {
            const mockData = [{ id: '1', content: 'Great!' }]
            const mockRange = jest.fn().mockResolvedValue({ data: mockData, error: null, count: 1 })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    range: mockRange
                })

            const result = await getComments('recipe1', 1, 5)

            expect(supabase.from).toHaveBeenCalledWith('comments')
            expect(mockRange).toHaveBeenCalledWith(0, 4)
            expect(result).toEqual({ comments: mockData, total: 1 })
        })

        it('handles empty data', async () => {
            const mockRange = jest.fn().mockResolvedValue({ data: null, error: null, count: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    range: mockRange
                })

            const result = await getComments('recipe1')
            expect(result).toEqual({ comments: [], total: 0 })
        })

        it('throws error on fetch failure', async () => {
            const mockRange = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' }, count: 0 })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    range: mockRange
                })

            await expect(getComments('recipe1')).rejects.toEqual({ message: 'DB Error' })
        })
    })

    describe('postComment', () => {
        it('throws error if user is not authenticated', async () => {
            Object.defineProperty(auth, 'currentUser', {
                value: null,
                writable: true
            })

            const formData = new FormData()
            await expect(postComment(formData)).rejects.toThrow('Usuario no autenticado')
        })

        it('posts comment successfully', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                })

            const result = await postComment(formData)

            expect(global.fetch).toHaveBeenCalledWith('/api/comments/create', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer mock-token'
                },
                body: formData
            })
            expect(result).toEqual({ success: true })
        })

        it('throws error on post failure', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({ error: 'Upload failed' })
                })

            await expect(postComment(formData)).rejects.toThrow('Upload failed')
        })

        it('throws default error on post failure without message', async () => {
            const formData = new FormData()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    json: async () => ({})
                })

            await expect(postComment(formData)).rejects.toThrow('Error al publicar comentario')
        })
    })
})
