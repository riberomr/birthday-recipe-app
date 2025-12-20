import { getUsers, getUsersWithRecipes, getUserProfile, updateUserProfile } from '../users'
import { supabase } from '@/lib/supabase/client'

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn()
        }))
    }
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
    console.error = jest.fn()
})
afterAll(() => {
    console.error = originalConsoleError
})

describe('lib/api/users', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUsers', () => {
        it('fetches users successfully', async () => {
            const mockUsers = [{ id: '1', full_name: 'User 1' }]
            const mockOrder = jest.fn().mockResolvedValue({ data: mockUsers, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsers()

            expect(supabase.from).toHaveBeenCalledWith('profiles')
            expect(result).toEqual(mockUsers)
        })

        it('returns empty array on error', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsers()

            expect(console.error).toHaveBeenCalledWith('Error fetching users:', { message: 'DB Error' })
            expect(result).toEqual([])
        })

        it('returns empty array when data is null', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsers()

            expect(result).toEqual([])
        })
    })

    describe('getUsersWithRecipes', () => {
        it('fetches and transforms users with recipes successfully', async () => {
            const mockData = [
                {
                    id: '1',
                    full_name: 'User 1',
                    recipes: [{ count: 5 }]
                },
                {
                    id: '2',
                    full_name: 'User 2',
                    recipes: [{ count: 0 }]
                },
                {
                    id: '3',
                    full_name: 'User 3',
                    recipes: [] // Edge case: no count returned
                }
            ]
            const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsersWithRecipes()

            expect(supabase.from).toHaveBeenCalledWith('profiles')
            // Should only return User 1 (count > 0)
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('1')
            expect(result[0].recipe_count).toBe(5)
        })

        it('returns empty array on error', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsersWithRecipes()

            expect(console.error).toHaveBeenCalledWith('Error fetching users with recipes:', { message: 'DB Error' })
            expect(result).toEqual([])
        })

        it('returns empty array when data is null', async () => {
            const mockOrder = jest.fn().mockResolvedValue({ data: null, error: null })

                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnThis(),
                    order: mockOrder
                })

            const result = await getUsersWithRecipes()

            expect(result).toEqual([])
        })
    })

    describe('getUserProfile', () => {
        it('fetches user profile successfully', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: { id: '1', full_name: 'Test User' }, error: null })
            const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnValue({ eq: mockEq })
                })

            const result = await getUserProfile('fb1')
            expect(result).toEqual({ id: '1', full_name: 'Test User' })
        })

        it('returns null on error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
            const mockEq = jest.fn().mockReturnValue({ single: mockSingle })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnValue({ eq: mockEq })
                })

            const result = await getUserProfile('fb1')
            expect(result).toBeNull()
            consoleSpy.mockRestore()
        })
    })

    describe('updateUserProfile', () => {
        it('updates user profile successfully', async () => {
            const mockSingle = jest.fn().mockResolvedValue({ data: { id: '1', full_name: 'Updated User' }, error: null })
            const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
            const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
            const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    update: mockUpdate
                })

            const result = await updateUserProfile('fb1', { full_name: 'Updated User' })
            expect(result).toEqual({ id: '1', full_name: 'Updated User' })
        })

        it('throws error on update failure', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
            const mockSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Update Error' } })
            const mockSelect = jest.fn().mockReturnValue({ single: mockSingle })
            const mockEq = jest.fn().mockReturnValue({ select: mockSelect })
            const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
                ; (supabase.from as jest.Mock).mockReturnValue({
                    update: mockUpdate
                })

            await expect(updateUserProfile('fb1', { full_name: 'Updated User' })).rejects.toEqual({ message: 'Update Error' })
            consoleSpy.mockRestore()
        })
    })
})
