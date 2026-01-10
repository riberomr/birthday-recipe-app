import { renderHook } from '@testing-library/react';
import { useDeleteRecipe } from '../useDeleteRecipe';
import { deleteRecipe } from '@/lib/api/recipes';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');

describe('useDeleteRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('deletes recipe successfully and invalidates cache', async () => {
        (deleteRecipe as jest.Mock).mockResolvedValue({ success: true });
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

        const { result } = renderHook(() => useDeleteRecipe('user1'), { wrapper });

        await result.current.mutateAsync('1');

        expect(deleteRecipe).toHaveBeenCalledWith('1');
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes', '1'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes', 'my-recipes', 'user1'] });
    });
});
