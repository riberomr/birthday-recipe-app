import { renderHook, waitFor } from '@testing-library/react';
import { useMyRecipes } from '../useMyRecipes';
import { getRecipes } from '@/lib/api/recipes';
import { useAuth } from '@/components/AuthContext';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');
jest.mock('@/components/AuthContext');

describe('useMyRecipes', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
        (useAuth as jest.Mock).mockReturnValue({ profile: { id: 'user-1' } });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('fetches my recipes successfully', async () => {
        const mockData = { recipes: [{ id: '1', title: 'My Recipe' }], total: 1 };
        (getRecipes as jest.Mock).mockResolvedValue(mockData);

        const { result } = renderHook(() => useMyRecipes(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.pages[0].recipes).toEqual(mockData.recipes);
        expect(getRecipes).toHaveBeenCalledWith(1, 6, { user_id: 'user-1' });
    });

    it('is disabled when no user', async () => {
        (useAuth as jest.Mock).mockReturnValue({ profile: null });

        const { result } = renderHook(() => useMyRecipes(), { wrapper });

        expect(result.current.status).toBe('pending');
        expect(result.current.fetchStatus).toBe('idle');
        expect(getRecipes).not.toHaveBeenCalled();
    });
    it('handles pagination', async () => {
        const page1 = { recipes: Array(6).fill({ id: '1' }), total: 12 };
        const page2 = { recipes: Array(6).fill({ id: '2' }), total: 12 };

        (getRecipes as jest.Mock).mockImplementation((page) => {
            if (page === 1) return Promise.resolve(page1);
            if (page === 2) return Promise.resolve(page2);
            return Promise.resolve({ recipes: [], total: 0 });
        });

        const { result } = renderHook(() => useMyRecipes(), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.hasNextPage).toBe(true);

        await result.current.fetchNextPage();

        await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
        expect(result.current.hasNextPage).toBe(false);
    });
});
