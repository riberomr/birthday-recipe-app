/**
 * @jest-environment node
 */
import { GET, POST } from './route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest, getProfileFromFirebase } from '@/lib/auth/requireAuth';

// Mock dependencies
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn()
    }
}));

jest.mock('@/lib/auth/requireAuth', () => ({
    getUserFromRequest: jest.fn(),
    getProfileFromFirebase: jest.fn()
}));

describe('app/api/favorites/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('returns favorites successfully', async () => {
            const mockData = [{
                recipe_id: '1',
                recipes: {
                    id: '1',
                    title: 'Recipe 1',
                    ratings: [{ rating: 5 }]
                }
            }];
            const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: mockOrder
            });

            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'user-1' });

            const request = new Request('http://localhost/api/favorites?userId=user-1');
            const response = await GET(request);
            const json = await response.json();

            expect(supabaseAdmin.from).toHaveBeenCalledWith('favorites');
            expect(json).toHaveLength(1);
            expect(json[0].average_rating).toEqual({ rating: 5, count: 1 });
        });

        it('returns error on failure', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: mockOrder
            });

            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'user-1' });

            const request = new Request('http://localhost/api/favorites?userId=user-1');
            const response = await GET(request);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'DB Error' });
        });

        it('returns 400 if userId is missing', async () => {
            const request = new Request('http://localhost/api/favorites');
            const response = await GET(request);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json).toEqual({ error: 'Missing userId' });
        });
    });

    describe('POST', () => {
        it('adds favorite successfully', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
            const mockInsert = jest.fn().mockResolvedValue({ error: null });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingle,
                insert: mockInsert
            });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);
            const json = await response.json();

            expect(mockInsert).toHaveBeenCalledWith([{ user_id: 'user-1', recipe_id: '1' }]);
            expect(json).toEqual({ isFavorite: true });
        });

        it('removes favorite successfully', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'fav-1' }, error: null });

            // For the delete part, we need to ensure the last call returns the promise result
            // But here we are mocking everything to return `this`.
            // The actual code awaits the result of the chain.
            // So the last `.eq` should return the promise.

            // Let's try a different approach for mocking
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockImplementation(function (this: any) {
                    // If this is the last call in the delete chain, return the result
                    // But it's hard to know.
                    return this;
                }),
                single: mockSingle,
                delete: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                then: jest.fn((resolve) => resolve({ error: null })) // Make the chain awaitable
            });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);
            const json = await response.json();

            expect(json).toEqual({ isFavorite: false });
        });

        it('returns 401 if not authenticated', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue(null);

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);

            expect(response.status).toBe(401);
        });
        it('returns 400 if recipeId is missing', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({})
            });
            const response = await POST(request);
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json).toEqual({ error: 'Missing recipeId' });
        });

        it('returns 500 on unexpected error', async () => {
            (getUserFromRequest as jest.Mock).mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Unexpected Error' });
        });

        it('returns error on delete failure', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockSingle = jest.fn().mockResolvedValue({ data: { id: 'fav-1' }, error: null });

            // Mock delete returning an error
            const mockDeleteChain = {
                eq: jest.fn()
            };
            mockDeleteChain.eq
                .mockReturnValueOnce(mockDeleteChain)
                .mockResolvedValueOnce({ error: { message: 'Delete Error' } });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingle,
                delete: jest.fn().mockReturnValue(mockDeleteChain)
            });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Delete Error' });
        });

        it('returns error on insert failure', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
            const mockInsert = jest.fn().mockResolvedValue({ error: { message: 'Insert Error' } });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingle,
                insert: mockInsert
            });

            const request = new Request('http://localhost/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ recipeId: '1' })
            });
            const response = await POST(request);
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Insert Error' });
        });
    });
});