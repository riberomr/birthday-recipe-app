/**
 * @jest-environment node
 */
import { GET } from './route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Mock Supabase
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn()
        }))
    }
}));

describe('app/api/users/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('GET returns users successfully', async () => {
        const mockUsers = [{ id: '1', full_name: 'User 1' }];
        const mockOrder = jest.fn().mockResolvedValue({ data: mockUsers, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/users');
        const response = await GET(request);
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('profiles');
        expect(json).toEqual({ data: mockUsers, error: null });
    });

    it('GET returns users with recipes when query param is present', async () => {
        const mockUsers = [{ id: '1', full_name: 'User 1', recipes: [{ count: 5 }] }];
        const mockOrder = jest.fn().mockResolvedValue({ data: mockUsers, error: null });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/users?withRecipes=true');
        const response = await GET(request);
        const json = await response.json();

        expect(supabaseAdmin.from).toHaveBeenCalledWith('profiles');
        expect(json.data).toHaveLength(1);
        expect(json.data[0].recipe_count).toBe(5);
    });

    it('GET returns error on failure', async () => {
        const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        (supabaseAdmin.from as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: mockOrder
        });

        const request = new Request('http://localhost/api/users');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB Error' });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/users');
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
