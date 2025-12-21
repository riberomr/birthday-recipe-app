import { renderHook } from '@testing-library/react';
import { usePermanentDeleteRecipe } from '../usePermanentDeleteRecipe';
import { deleteRecipePermanently } from '@/lib/api/recipes';
import { createQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/recipes');

describe('usePermanentDeleteRecipe', () => {
    let queryClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = createQueryClient();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    it('permanently deletes recipe successfully and invalidates cache', async () => {
        (deleteRecipePermanently as jest.Mock).mockResolvedValue({ success: true });
        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
        const removeSpy = jest.spyOn(queryClient, 'removeQueries');

        const { result } = renderHook(() => usePermanentDeleteRecipe(), { wrapper });

        await result.current.mutateAsync('1');

        expect(deleteRecipePermanently).toHaveBeenCalledWith('1');
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recipes'] });
        expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['recipes', '1'] });
    });
});
