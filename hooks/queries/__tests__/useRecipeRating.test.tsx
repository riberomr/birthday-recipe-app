import { renderHook, waitFor } from '@testing-library/react';
import { useRecipeRating } from '../useRecipeRating';
import { getRecipeRating } from '@/lib/api/ratings';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/ratings');

describe('useRecipeRating', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('fetches recipe rating', async () => {
        (getRecipeRating as jest.Mock).mockResolvedValue({ average: 4.5, count: 10 });

        const { result } = renderHook(() => useRecipeRating('recipe-1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual({ average: 4.5, count: 10 });
        expect(getRecipeRating).toHaveBeenCalledWith('recipe-1');
    });

    it('handles error', async () => {
        (getRecipeRating as jest.Mock).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() => useRecipeRating('recipe-1'), { wrapper });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('is disabled when recipeId is empty', () => {
        const { result } = renderHook(() => useRecipeRating(''), { wrapper });
        expect(result.current.fetchStatus).toBe('idle');
        expect(getRecipeRating).not.toHaveBeenCalled();
    });
});
