import { renderHook, waitFor } from '@testing-library/react';
import { useUpdateProfile } from '../useUpdateProfile';
import { updateUserProfile } from '@/lib/api/users';
import { useQueryClient } from '@tanstack/react-query';

// Mock the API
jest.mock('@/lib/api/users', () => ({
    updateUserProfile: jest.fn().mockResolvedValue({}),
}));

// Mock React Query
const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
    useMutation: jest.fn(({ mutationFn, onSuccess }) => {
        return {
            mutate: (variables: any) => {
                mutationFn(variables).then((data: any) => {
                    if (onSuccess) onSuccess(data, variables, undefined);
                });
            },
        };
    }),
    useQueryClient: jest.fn(() => ({
        invalidateQueries: mockInvalidateQueries,
    })),
}));

describe('useUpdateProfile', () => {
    it('should update profile and invalidate queries', async () => {
        const { result } = renderHook(() => useUpdateProfile());
        const mockUpdates = { full_name: 'Updated Name' };

        result.current.mutate({ firebaseUid: 'fb1', updates: mockUpdates });

        await waitFor(() => {
            expect(updateUserProfile).toHaveBeenCalledWith('fb1', mockUpdates);
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'fb1'] });
        });
    });
});
