import { renderHook } from '@testing-library/react';
import { useUpdateRecipe } from '../useUpdateRecipe';
import { updateRecipe } from '@/lib/api/recipes';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');

describe('useUpdateRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('updates recipe successfully and invalidates cache', async () => {
        (updateRecipe as jest.Mock).mockResolvedValue({ success: true });
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useUpdateRecipe(), { wrapper });

        const formData = new FormData();
        formData.append('title', 'Updated Recipe');

        await result.current.mutateAsync({ id: '1', formData });

        expect(updateRecipe).toHaveBeenCalledWith('1', formData);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes', '1'] });
    });
});
