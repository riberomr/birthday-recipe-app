/**
 * @jest-environment node
 */
import { GET } from './route';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Mock Supabase
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: jest.fn()
        }))
    }
}));

describe('app/api/comments/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns comments successfully', async () => {
        const mockComments = [{ id: '1', content: 'Great!' }];
        const mockRange = jest.fn().mockResolvedValue({ data: mockComments, error: null, count: 1 });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: mockRange
        });

        const request = new Request('http://localhost/api/comments?recipeId=1&page=1&limit=5');
        const response = await GET(request);
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('comments');
        expect(json.data).toEqual({ comments: mockComments, total: 1 });
    });

    it('GET handles null data and count', async () => {
        const mockRange = jest.fn().mockResolvedValue({ data: null, error: null, count: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: mockRange
        });

        const request = new Request('http://localhost/api/comments?recipeId=1');
        const response = await GET(request);
        const json = await response.json();

        expect(json.data).toEqual({ comments: [], total: 0 });
    });

    it('GET returns error on failure', async () => {
        const mockRange = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' }, count: 0 });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            range: mockRange
        });

        const request = new Request('http://localhost/api/comments?recipeId=1');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 400 if recipeId is missing', async () => {
        const request = new Request('http://localhost/api/comments');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Missing recipeId' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/comments?recipeId=1');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
