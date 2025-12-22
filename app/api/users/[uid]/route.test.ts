/**
 * @jest-environment node
 */
import { GET, PATCH } from './route';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest } from '@/lib/auth/requireAuth';
import { NextResponse } from 'next/server';

// Mock Supabase
jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            update: jest.fn().mockReturnThis()
        }))
    }
}));

// Mock Auth
jest.mock('@/lib/auth/requireAuth', () => ({
    getUserFromRequest: jest.fn()
}));

describe('app/api/users/[uid]/route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET', () => {
        it('returns user profile successfully', async () => {
            const mockUser = { id: '1', full_name: 'Test User' };
            const mockSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingle
            });

            const request = new Request('http://localhost/api/users/fb1');
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(supabaseAdmin.from).toHaveBeenCalledWith('profiles');
            expect(json).toEqual({ data: mockUser, error: null });
        });

        it('returns error on failure', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingle
            });

            const request = new Request('http://localhost/api/users/fb1');
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await GET(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'DB Error' });
        });
    });

    describe('PATCH', () => {
        it('updates user profile successfully', async () => {
            const mockUser = { id: '1', full_name: 'Updated User' };
            const mockSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });

            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: mockSingle
            });

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated User' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(json).toEqual({ data: mockUser, error: null });
        });

        it('returns 401 if unauthorized', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue(null);

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated User' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(response.status).toBe(401);
            expect(json).toEqual({ error: 'Unauthorized' });
        });

        it('returns 400 for invalid payload', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });

            const invalidPayloads = [null, [], 'string', 123];

            for (const payload of invalidPayloads) {
                const request = new Request('http://localhost/api/users/fb1', {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                const params = Promise.resolve({ uid: 'fb1' });
                const response = await PATCH(request, { params });
                const json = await response.json();

                expect(response.status).toBe(400);
                expect(json).toEqual({ error: 'Invalid update payload' });
            }
        });

        it('returns 400 if no valid fields to update', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({})
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json).toEqual({ error: 'No valid fields to update' });
        });

        it('filters out forbidden fields', async () => {
            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });

            // Payload with only forbidden fields
            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ id: '123', created_at: 'date', firebase_uid: 'fb2' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(response.status).toBe(400);
            expect(json).toEqual({ error: 'No valid fields to update' });
        });

        it('updates only allowed fields', async () => {
            const mockUser = { id: '1', full_name: 'Updated Name' };
            const mockSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });
            const updateMock = jest.fn().mockReturnThis();

            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                update: updateMock,
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: mockSingle
            });

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated Name', id: 'bad-id' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(updateMock).toHaveBeenCalledWith({ full_name: 'Updated Name' });
            expect(json).toEqual({ data: mockUser, error: null });
        });

        it('returns error on DB failure', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            (getUserFromRequest as jest.Mock).mockResolvedValue({ uid: 'fb1' });
            (supabaseAdmin.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: mockSingle
            });

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated User' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'DB Error' });
        });

        it('returns 500 on unexpected error', async () => {
            (getUserFromRequest as jest.Mock).mockImplementation(() => {
                throw new Error('Unexpected Error');
            });

            const request = new Request('http://localhost/api/users/fb1', {
                method: 'PATCH',
                body: JSON.stringify({ full_name: 'Updated User' })
            });
            const params = Promise.resolve({ uid: 'fb1' });
            const response = await PATCH(request, { params });
            const json = await response.json();

            expect(response.status).toBe(500);
            expect(json).toEqual({ error: 'Unexpected Error' });
        });
    });

    it('GET returns 500 on unexpected error', async () => {
        (supabaseAdmin.from as jest.Mock).mockImplementation(() => {
            throw new Error('Unexpected Error');
        });

        const request = new Request('http://localhost/api/users/fb1');
        const params = Promise.resolve({ uid: 'fb1' });
        const response = await GET(request, { params });
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Unexpected Error' });
    });
});
