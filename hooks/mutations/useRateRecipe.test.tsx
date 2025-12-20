import { renderHook, waitFor, act } from '@testing-library/react';
import { useRateRecipe } from './useRateRecipe';
import { upsertRating } from '@/lib/api/ratings';
import { useAuth } from '@/components/AuthContext';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/ratings');
jest.mock('@/components/AuthContext');

describe('useRateRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
        (useAuth as jest.Mock).mockReturnValue({ profile: { id: 'user-1' } });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('optimistically updates rating', async () => {
        (upsertRating as jest.Mock).mockResolvedValue({ success: true });

        // Pre-populate cache
        queryClient.setQueryData(['ratings', 'recipe-1', 'user', 'user-1'], 3);

        const { result } = renderHook(() => useRateRecipe(), { wrapper });

        await act(async () => {
            result.current.mutate({ recipeId: 'recipe-1', rating: 5 });
        });

        // Check optimistic update
        const cachedData = queryClient.getQueryData(['ratings', 'recipe-1', 'user', 'user-1']);
        expect(cachedData).toBe(5);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(upsertRating).toHaveBeenCalledWith('recipe-1', 5);
    });

    it('rolls back on error', async () => {
        (upsertRating as jest.Mock).mockRejectedValue(new Error('Failed'));

        // Pre-populate cache
        queryClient.setQueryData(['ratings', 'recipe-1', 'user', 'user-1'], 3);

        const { result } = renderHook(() => useRateRecipe(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ recipeId: 'recipe-1', rating: 5 });
            } catch (e) {
                // Expected
            }
        });

        // Check rollback
        const cachedData = queryClient.getQueryData(['ratings', 'recipe-1', 'user', 'user-1']);
        expect(cachedData).toBe(3);
    });

    it('does not rollback if no previous rating on error', async () => {
        (upsertRating as jest.Mock).mockRejectedValue(new Error('Failed'));

        // No previous rating in cache

        const { result } = renderHook(() => useRateRecipe(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ recipeId: 'recipe-1', rating: 5 });
            } catch (e) {
                // Expected
            }
        });

        // Cache should still be empty (or undefined)
        const cachedData = queryClient.getQueryData(['ratings', 'recipe-1', 'user', 'user-1']);
        expect(cachedData).toBeUndefined();
    });

    it('does nothing if not authenticated', async () => {
        (useAuth as jest.Mock).mockReturnValue({ profile: null });
        (upsertRating as jest.Mock).mockResolvedValue({ success: true });

        const { result } = renderHook(() => useRateRecipe(), { wrapper });

        await act(async () => {
            result.current.mutate({ recipeId: 'recipe-1', rating: 5 });
        });

        // Optimistic update should not happen
        const cachedData = queryClient.getQueryData(['ratings', 'recipe-1', 'user', 'user-1']);
        expect(cachedData).toBeUndefined();
    });

    it('does not rollback (no-op) if not authenticated and error occurs', async () => {
        (useAuth as jest.Mock).mockReturnValue({ profile: null });
        (upsertRating as jest.Mock).mockRejectedValue(new Error('Failed'));

        const { result } = renderHook(() => useRateRecipe(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync({ recipeId: 'recipe-1', rating: 5 });
            } catch (e) {
                // Expected
            }
        });

        // Should not have crashed and nothing in cache
        expect(queryClient.getQueryData(['ratings', 'recipe-1', 'user', 'user-1'])).toBeUndefined();
    });
});

