import { renderHook, waitFor } from '@testing-library/react';
import { useFavorites } from '../useFavorites';
import { getFavorites } from '@/lib/api/favorites';
import { wrapper } from '@/lib/test-utils';

jest.mock('@/lib/api/favorites');

describe('useFavorites', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('fetches favorites when userId is provided', async () => {
        const mockFavorites = [{ id: '1', title: 'Test' }];
        (getFavorites as jest.Mock).mockResolvedValue(mockFavorites);

        const { result } = renderHook(() => useFavorites('user-1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockFavorites);
        expect(getFavorites).toHaveBeenCalledWith('user-1');
    });

    it('does not fetch when userId is undefined', () => {
        const { result } = renderHook(() => useFavorites(undefined), { wrapper });

        expect(result.current.fetchStatus).toBe('idle');
        expect(getFavorites).not.toHaveBeenCalled();
    });
});
