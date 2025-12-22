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
            not: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: jest.fn()
        }))
    }
}));

describe('app/api/recipes/[id]/photos/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns photos successfully', async () => {
        const mockPhotos = [{ image_url: 'url1' }];
        const mockOrder = jest.fn().mockResolvedValue({ data: mockPhotos, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes/1/photos');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('comments');
        expect(json.data).toEqual(mockPhotos);
    });

    it('GET handles null data', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes/1/photos');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(json.data).toEqual([]);
    });

    it('GET returns error on failure', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            neq: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes/1/photos');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/recipes/1/photos');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
