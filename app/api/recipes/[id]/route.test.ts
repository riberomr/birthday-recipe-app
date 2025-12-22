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
            single: jest.fn()
        }))
    }
}));

describe('app/api/recipes/[id]/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns recipe successfully', async () => {
        const mockRecipe = {
            id: '1',
            title: 'Recipe 1',
            ratings: [],
            recipe_steps: [{ step_order: 2 }, { step_order: 1 }]
        };
        const mockSingle = jest.fn().mockResolvedValue({ data: mockRecipe, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: mockSingle
        });

        const request = new Request('http://localhost/api/recipes/1');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('recipes');
        expect(json.data).toEqual(expect.objectContaining({ id: '1' }));
        expect(json.data.recipe_steps[0].step_order).toBe(1); // Sorted
    });

    it('GET handles null ratings and steps', async () => {
        const mockRecipe = {
            id: '1',
            title: 'Recipe 1',
            ratings: null,
            recipe_steps: null
        };
        const mockSingle = jest.fn().mockResolvedValue({ data: mockRecipe, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: mockSingle
        });

        const request = new Request('http://localhost/api/recipes/1');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(json.data.average_rating).toEqual({ count: 0, rating: 0 });
        expect(json.data.recipe_steps).toBeNull();
    });

    it('GET returns null data if not found', async () => {
        const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: mockSingle
        });

        const request = new Request('http://localhost/api/recipes/1');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(json.data).toBeNull();
    });

    it('GET returns error on failure', async () => {
        const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: mockSingle
        });

        const request = new Request('http://localhost/api/recipes/1');
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

        const request = new Request('http://localhost/api/recipes/1');
        const params = Promise.resolve({ id: '1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
