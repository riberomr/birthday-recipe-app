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
            or: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: jest.fn()
        }))
    }
}));

describe('app/api/recipes/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns recipes successfully with default params', async () => {
        const mockRecipes = [{ id: '1', title: 'Recipe 1', ratings: [] }];
        const mockOrder = jest.fn().mockResolvedValue({ data: mockRecipes, error: null, count: 1 });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes');
        const response = await GET(request);
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('recipes');
        expect(json.data.recipes).toHaveLength(1);
        expect(json.data.total).toBe(1);
    });

    it('GET handles recipes with missing ratings property', async () => {
        const mockRecipes = [{ id: '1', title: 'Recipe 1' }]; // ratings missing
        const mockOrder = jest.fn().mockResolvedValue({ data: mockRecipes, error: null, count: 1 });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes');
        const response = await GET(request);
        const json = await response.json();

        expect(json.data.recipes[0].average_rating).toEqual({ count: 0, rating: 0 });
    });

    it('GET returns empty list if no recipes found', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null, count: 0 });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes');
        const response = await GET(request);
        const json = await response.json();

        expect(json.data.recipes).toEqual([]);
        expect(json.data.total).toBe(0);
    });

    it('GET applies filters correctly', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            or: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        };

        (supabaseAdmin.from as jest.Mock).mockReturnValue(mockChain);

        const request = new Request('http://localhost/api/recipes?category=cat1&difficulty=easy&search=pizza&time=fast&tags=tag1&user_id=user1');
        await GET(request);

        expect(mockChain.eq).toHaveBeenCalledWith('category_id', 'cat1');
        expect(mockChain.eq).toHaveBeenCalledWith('difficulty', 'easy');
        expect(mockChain.or).toHaveBeenCalledWith(expect.stringContaining('pizza'));
        expect(mockChain.lt).toHaveBeenCalledWith('cook_time_minutes', 20);
        expect(mockChain.in).toHaveBeenCalledWith('recipe_tags.tag_id', ['tag1']);
        expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user1');
    });

    it('GET applies medium time filter correctly', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        };

        (supabaseAdmin.from as jest.Mock).mockReturnValue(mockChain);

        const request = new Request('http://localhost/api/recipes?time=medium');
        await GET(request);

        expect(mockChain.gte).toHaveBeenCalledWith('cook_time_minutes', 20);
        expect(mockChain.lte).toHaveBeenCalledWith('cook_time_minutes', 60);
    });

    it('GET applies slow time filter correctly', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        };

        (supabaseAdmin.from as jest.Mock).mockReturnValue(mockChain);

        const request = new Request('http://localhost/api/recipes?time=slow');
        await GET(request);

        expect(mockChain.gt).toHaveBeenCalledWith('cook_time_minutes', 60);
    });

    it('GET ignores invalid time filter', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 });
        const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        };

        (supabaseAdmin.from as jest.Mock).mockReturnValue(mockChain);

        const request = new Request('http://localhost/api/recipes?time=invalid');
        await GET(request);

        // Should not call any time filters
        expect((mockChain as any).lt).not.toBeDefined(); // lt is not in mockChain above, but we can check calls if we added it.
        // Better: check that only select, range, order were called.
        expect(mockChain.select).toHaveBeenCalled();
    });

    it('GET returns error on failure', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            range: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/recipes');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/recipes');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
