import { renderHook, waitFor } from '@testing-library/react';
import { useRecipe } from '../useRecipe';
import { getRecipe } from '@/lib/api/recipes';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');

describe('useRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('fetches recipe successfully', async () => {
        const mockRecipe = { id: '1', title: 'Test Recipe' };
        (getRecipe as jest.Mock).mockResolvedValue(mockRecipe);

        const { result } = renderHook(() => useRecipe('1'), { wrapper });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockRecipe);
        expect(getRecipe).toHaveBeenCalledWith('1');
    });

    it('uses placeholder data from cache', async () => {
        const mockRecipe = { id: '1', title: 'Cached Recipe' };

        // Pre-populate list cache
        queryClient.setQueryData(['recipes'], {
            pages: [{ recipes: [mockRecipe], total: 1, page: 1 }],
            pageParams: [1]
        });

        // Mock API to delay or return something else to prove placeholder usage
        // But useQuery will use placeholder immediately while fetching
        (getRecipe as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ...mockRecipe, title: 'Fresh Recipe' }), 100)));

        const { result } = renderHook(() => useRecipe('1'), { wrapper });

        // Should have data immediately
        expect(result.current.data).toEqual(mockRecipe);
        expect(result.current.isPlaceholderData).toBe(true);

        // Eventually updates
        await waitFor(() => expect(result.current.data?.title).toBe('Fresh Recipe'));
        expect(result.current.isPlaceholderData).toBe(false);
    });
});
