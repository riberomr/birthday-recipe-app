import { renderHook, waitFor, act } from '@testing-library/react';
import { useToggleFavorite } from './useToggleFavorite';
import { toggleFavorite } from '@/lib/api/favorites';
import { useAuth } from '@/components/AuthContext';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/favorites');
jest.mock('@/components/AuthContext');

describe('useToggleFavorite', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
        (useAuth as jest.Mock).mockReturnValue({ supabaseUser: { id: 'user-1' } });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('optimistically adds item to favorites', async () => {
        const recipe = { id: '1', title: 'Test Recipe' } as any;
        (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: true });

        // Pre-populate cache with empty list
        queryClient.setQueryData(['favorites', 'user-1'], []);

        const { result } = renderHook(() => useToggleFavorite(), { wrapper });

        await act(async () => {
            result.current.mutate(recipe);
        });

        // Check optimistic update (immediate)
        // We can check the cache directly
        const cachedData = queryClient.getQueryData(['favorites', 'user-1']);
        expect(cachedData).toContainEqual(recipe);

        // Wait for settlement
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(toggleFavorite).toHaveBeenCalledWith('1');
    });

    it('optimistically removes item from favorites', async () => {
        const recipe = { id: '1', title: 'Test Recipe' } as any;
        (toggleFavorite as jest.Mock).mockResolvedValue({ isFavorite: false });

        // Pre-populate cache with item
        queryClient.setQueryData(['favorites', 'user-1'], [recipe]);

        const { result } = renderHook(() => useToggleFavorite(), { wrapper });

        await act(async () => {
            result.current.mutate(recipe);
        });

        const cachedData = queryClient.getQueryData(['favorites', 'user-1']);
        expect(cachedData).toEqual([]);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('rolls back on error', async () => {
        const recipe = { id: '1', title: 'Test Recipe' } as any;
        (toggleFavorite as jest.Mock).mockRejectedValue(new Error('Failed'));

        // Pre-populate cache
        queryClient.setQueryData(['favorites', 'user-1'], []);

        const { result } = renderHook(() => useToggleFavorite(), { wrapper });

        await act(async () => {
            try {
                await result.current.mutateAsync(recipe);
            } catch (e) {
                // Expected error
            }
        });

        const cachedData = queryClient.getQueryData(['favorites', 'user-1']);
        expect(cachedData).toEqual([]); // Should be empty again
    });
});
