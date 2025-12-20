import { getUserFromRequest, getProfileFromFirebase } from './requireAuth'
import { adminAuth } from '@/lib/firebase/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Mock dependencies
jest.mock('@/lib/firebase/admin', () => ({
    adminAuth: {
        verifyIdToken: jest.fn()
    }
}))

jest.mock('@/lib/supabase/admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            insert: jest.fn().mockReturnThis()
        }))
    }
}))

// Mock console.error
const originalConsoleError = console.error
beforeAll(() => {
    console.error = jest.fn()
})
afterAll(() => {
    console.error = originalConsoleError
})

describe('lib/auth/requireAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserFromRequest', () => {
        it('returns null if no authorization header', async () => {
            const req = {
                headers: {
                    get: jest.fn().mockReturnValue(null)
                }
            } as unknown as Request

            const result = await getUserFromRequest(req)
            expect(result).toBeNull()
        })

        it('returns decoded token if valid token provided', async () => {
            const req = {
                headers: {
                    get: jest.fn().mockReturnValue('Bearer valid-token')
                }
            } as unknown as Request

            const mockDecodedToken = { uid: 'user1' }
                ; (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken)

            const result = await getUserFromRequest(req)

            expect(adminAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
            expect(result).toEqual(mockDecodedToken)
        })

        it('returns null and logs error if verification fails', async () => {
            const req = {
                headers: {
                    get: jest.fn().mockReturnValue('Bearer invalid-token')
                }
            } as unknown as Request

            const mockError = new Error('Invalid token')
                ; (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(mockError)

            const result = await getUserFromRequest(req)

            expect(console.error).toHaveBeenCalledWith('Error verifying token:', mockError)
            expect(result).toBeNull()
        })
    })

    describe('getProfileFromFirebase', () => {
        it('returns existing user if found', async () => {
            const mockUser = { id: 'user1', firebase_uid: 'fb1' }
            const mockSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null })

                ; (supabaseAdmin.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingle
                })

            const result = await getProfileFromFirebase('fb1')

            expect(supabaseAdmin.from).toHaveBeenCalledWith('profiles')
            expect(result).toEqual(mockUser)
        })

        it('creates new user if not found and email provided', async () => {
            // First call returns null (not found)
            const mockSingleFind = jest.fn().mockResolvedValue({ data: null, error: null })

            // Second call (insert) returns new user
            const mockNewUser = { id: 'new1', firebase_uid: 'fb1', email: 'test@example.com' }
            const mockSingleInsert = jest.fn().mockResolvedValue({ data: mockNewUser, error: null })

            // We need to mock the chain differently for the two calls
            // Or we can use mockImplementation to return different chains
            // But supabaseAdmin.from is called twice.

            const mockSelectChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingleFind
            }

            const mockInsertChain = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: mockSingleInsert
            }

                ; (supabaseAdmin.from as jest.Mock)
                    .mockReturnValueOnce(mockSelectChain)
                    .mockReturnValueOnce(mockInsertChain)

            const result = await getProfileFromFirebase('fb1', 'test@example.com', 'Test User', 'avatar.jpg')

            expect(supabaseAdmin.from).toHaveBeenNthCalledWith(1, 'profiles')
            expect(supabaseAdmin.from).toHaveBeenNthCalledWith(2, 'profiles')

            expect(mockInsertChain.insert).toHaveBeenCalledWith({
                firebase_uid: 'fb1',
                email: 'test@example.com',
                full_name: 'Test User',
                avatar_url: 'avatar.jpg'
            })
            expect(result).toEqual(mockNewUser)
        })

        it('throws error if email is missing when creating user', async () => {
            const mockSingleFind = jest.fn().mockResolvedValue({ data: null, error: null })

                ; (supabaseAdmin.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: mockSingleFind
                })

            await expect(getProfileFromFirebase('fb1')).rejects.toThrow('Email is required to create a user')
        })

        it('throws error if insert fails', async () => {
            const mockSingleFind = jest.fn().mockResolvedValue({ data: null, error: null })
            const mockSingleInsert = jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })

            const mockSelectChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: mockSingleFind
            }

            const mockInsertChain = {
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: mockSingleInsert
            }

                ; (supabaseAdmin.from as jest.Mock)
                    .mockReturnValueOnce(mockSelectChain)
                    .mockReturnValueOnce(mockInsertChain)

            await expect(getProfileFromFirebase('fb1', 'test@example.com'))
                .rejects.toEqual({ message: 'Insert failed' })

            expect(console.error).toHaveBeenCalledWith('Error creating user in Supabase:', { message: 'Insert failed' })
        })
    })
})
