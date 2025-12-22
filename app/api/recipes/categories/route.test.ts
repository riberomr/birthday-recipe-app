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
            order: jest.fn()
        }))
    }
}));

describe('app/api/recipes/categories/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns categories successfully', async () => {
        const mockCategories = [{ id: '1', name: 'Cat 1' }];
        const mockOrder = jest.fn().mockResolvedValue({ data: mockCategories, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const response = await GET();
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('recipe_categories');
        expect(json.data).toEqual(mockCategories);
    });

    it('GET handles null data', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const response = await GET();
        const json = await response.json();

        expect(json.data).toEqual([]);
    });

    it('GET returns error on failure', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const response = await GET();
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
