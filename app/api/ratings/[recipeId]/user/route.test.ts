/**
 * @jest-environment node
 */
import { GET, POST } from './route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest, getProfileFromFirebase } from '@/lib/auth/requireAuth';

// Mock dependencies
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            upsert: jest.fn()
        }))
    }
}));

jest.mock('@/lib/auth/requireAuth', () => ({
    getUserFromRequest: jest.fn(),
    getProfileFromFirebase: jest.fn()
}));

describe('app/api/ratings/[recipeId]/user/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('returns user rating successfully', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid' });

            const mockProfile = { id: 'user-1' };
            const mockProfileSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });

            const mockRating = { rating: 5 };
            const mockRatingSingle = jest.fn().mockResolvedValue({ data: mockRating, error: null });

            (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
                if (table === 'profiles') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockProfileSingle
                    };
                }
                if (table === 'ratings') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockRatingSingle
                    };
                }
                return {};
            });

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(json.data).toEqual({ rating: 5 });
        });

        it('returns 0 if no rating found', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid' });
            const mockProfile = { id: 'user-1' };
            const mockProfileSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
            const mockRatingSingle = jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // PGRST116 is "no rows returned"

            (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
                if (table === 'profiles') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockProfileSingle
                    };
                }
                if (table === 'ratings') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockRatingSingle
                    };
                }
                return {};
            });

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(json.data).toEqual({ rating: 0 });
        });

        it('returns 401 if not authenticated', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue(null);

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });

            expect(response.status).toBe(401);
        });

        it('returns 404 if profile not found', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid' });
            const mockProfileSingle = jest.fn().mockResolvedValue({ data: null, error: null });

            (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
                if (table === 'profiles') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockProfileSingle
                    };
                }
                return {};
            });

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(response.status).toBe(404);
            expect(json).toEqual({ error: 'Profile not found' });
        });

        it('returns error on DB failure', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid' });
            const mockProfile = { id: 'user-1' };
            const mockProfileSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
            const mockRatingSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            (supabaseAdmin.from as jest.Mock).mockImplementation((table) => {
                if (table === 'profiles') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockProfileSingle
                    };
                }
                if (table === 'ratings') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: mockRatingSingle
                    };
                }
                return {};
            });

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'DB Error' });
        });

        it('returns 500 on unexpected error', async () => {
            (getUserFromRequest as jest.Mock).mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const request = new Request('http://localhost/api/ratings/1/user');
            const params = Promise.resolve({ recipeId: '1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Unexpected Error' });
        });
    });

    describe('POST', () => {
        it('saves rating successfully', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockUpsert = jest.fn().mockResolvedValue({ error: null });
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                upsert: mockUpsert
            });

            const request = new Request('http://localhost/api/ratings/1/user', {
                method: 'POST',
                body: JSON.stringify({ rating: 5 })
            });
            const params = Promise.resolve({ recipeId: '1' });
            const response = await POST(request, { params });
            const json = await response.json();

            expect(mockUpsert).toHaveBeenCalledWith(
                { recipe_id: '1', user_id: 'user-1', rating: 5 },
                { onConflict: 'recipe_id,user_id' }
            );
            expect(json).toEqual({ success: true, error: null });
        });

        it('returns 401 if not authenticated', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue(null);

            const request = new Request('http://localhost/api/ratings/1/user', {
                method: 'POST',
                body: JSON.stringify({ rating: 5 })
            });
            const params = Promise.resolve({ recipeId: '1' });
            const response = await POST(request, { params });

            expect(response.status).toBe(401);
        });

        it('returns 400 if rating is missing', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const request = new Request('http://localhost/api/ratings/1/user', {
                method: 'POST',
                body: JSON.stringify({})
            });
            const params = Promise.resolve({ recipeId: '1' });
            const response = await POST(request, { params });
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json).toEqual({ error: 'Missing rating' });
        });

        it('returns error on save failure', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'firebase-uid', email: 'test@example.com' });
            (getProfileFromFirebase as jest.Mock).mockResolvedValue({ id: 'user-1' });

            const mockUpsert = jest.fn().mockResolvedValue({ error: { message: 'DB Error' } });
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                upsert: mockUpsert
            });

            const request = new Request('http://localhost/api/ratings/1/user', {
                method: 'POST',
                body: JSON.stringify({ rating: 5 })
            });
            const params = Promise.resolve({ recipeId: '1' });
            const response = await POST(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'DB Error' });
        });

        it('returns 500 on unexpected error', async () => {
            (getUserFromRequest as jest.Mock).mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const request = new Request('http://localhost/api/ratings/1/user', {
                method: 'POST',
                body: JSON.stringify({ rating: 5 })
            });
            const params = Promise.resolve({ recipeId: '1' });
            const response = await POST(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Unexpected Error' });
        });
    });
});
