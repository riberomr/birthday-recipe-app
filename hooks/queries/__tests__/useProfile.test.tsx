import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';
import { getUserProfile } from '@/lib/api/users';

// Mock the API
jest.mock('@/lib/api/users', () => ({
    getUserProfile: jest.fn(),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(({ queryFn, enabled }) => {
        if (enabled === false) return { data: undefined, isLoading: false };
        const data = queryFn();
        return { data, isLoading: false };
    }),
}));

describe('useProfile', () => {
    it('should not fetch profile if firebaseUid is undefined', () => {
        renderHook(() => useProfile(undefined));
        expect(getUserProfile).not.toHaveBeenCalled();
    });

    it('should fetch profile if firebaseUid is provided', async () => {
        const mockProfile = { id: '1', firebase_uid: 'fb1', full_name: 'Test' };
        (getUserProfile as jest.Mock).mockReturnValue(mockProfile);

        renderHook(() => useProfile('fb1'));

        await waitFor(() => {
            expect(getUserProfile).toHaveBeenCalledWith('fb1');
        });
    });
});
