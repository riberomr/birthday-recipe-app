/**
 * @jest-environment node
 */
import { GET } from './route'
import { NextResponse } from 'next/server'
import { getUserFromRequest, getSupabaseUserFromFirebaseUid } from '@/lib/auth/requireAuth'

// Mock dependencies
jest.mock('@/lib/auth/requireAuth', () => ({
    getUserFromRequest: jest.fn(),
    getSupabaseUserFromFirebaseUid: jest.fn(),
}))

describe('/api/me', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns user when authenticated', async () => {
        const mockUser = { uid: '123', email: 'test@example.com', name: 'Test', picture: 'pic' }
        const mockSupabaseUser = { id: '123', full_name: 'Test' }

            ; (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser)
            ; (getSupabaseUserFromFirebaseUid as jest.Mock).mockResolvedValue(mockSupabaseUser)

        const request = new Request('http://localhost/api/me')
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.user).toEqual(mockSupabaseUser)
    })

    it('returns 401 when unauthenticated', async () => {
        ; (getUserFromRequest as jest.Mock).mockResolvedValue(null)

        const request = new Request('http://localhost/api/me')
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.user).toBeNull()
    })

    it('returns 500 on error', async () => {
        ; (getUserFromRequest as jest.Mock).mockRejectedValue(new Error('Test error'))

        const request = new Request('http://localhost/api/me')
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Internal Server Error')
    })
})
