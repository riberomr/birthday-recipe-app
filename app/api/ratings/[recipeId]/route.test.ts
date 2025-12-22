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
            eq: jest.fn().mockReturnThis()
        }))
    }
}));

describe('app/api/ratings/[recipeId]/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns average rating successfully', async () => {
        const mockRatings = [{ rating: 4 }, { rating: 5 }];
        const mockEq = jest.fn().mockResolvedValue({ data: mockRatings, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: mockEq
        });

        const request = new Request('http://localhost/api/ratings/1');
        const params = Promise.resolve({ recipeId: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('ratings');
        expect(json.data).toEqual({ average: 4.5, count: 2 });
    });

    it('GET returns 0 when no ratings', async () => {
        const mockEq = jest.fn().mockResolvedValue({ data: [], error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: mockEq
        });

        const request = new Request('http://localhost/api/ratings/1');
        const params = Promise.resolve({ recipeId: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(json.data).toEqual({ average: 0, count: 0 });
    });

    it('GET returns error on failure', async () => {
        const mockEq = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: mockEq
        });

        const request = new Request('http://localhost/api/ratings/1');
        const params = Promise.resolve({ recipeId: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/ratings/1');
        const params = Promise.resolve({ recipeId: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
